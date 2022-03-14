
import { IAssessmentWeightage, IProject, IProjectWeightage } from '../models/project';

import axios from "axios";
import { get, set } from 'idb-keyval';
import { getMyAPIHost, updateSyncDetails } from './master-functions';
import moment from "moment";
import { getUserInfo } from './user-functions';


export const setProjectInfo=(project:IProject) =>{ 
  
    localStorage.setItem('project-info',JSON.stringify(project));
}


export const downloadProjectList=(callback:(projects:IProject[])=>void):void=>
{
    let user = getUserInfo();
    let endPoint = 'getallassessmentprojects?CompanyID='+user.companyID;
    if (user.groupId==='7')
        endPoint = 'GetAllAssessmentProjectsByAssessorUserID?UserID='+user.userId;
    axios.get(getMyAPIHost() + endPoint, { headers: { SessionId: user.sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let projects:IProject[] = [];
            let assessors:string[]=[];

            response.data.forEach((project:any)=>
            {   
                assessors.length=0;
                project.assessment_project_assessors_detail.forEach((assessor:any)=>{
                    assessors.push(assessor.assessors_master.AssessorsName)
                })
                projects.push ({id:project.ProjectID,
                    name: project.Project_Name,
                    developer: project.Developer_Name,
                    contractor: project.Contractor_Name,
                    dateOfAssessment: project.Assessment_Dates,
                    assessors: assessors.join(','),
                    assessorType:project.AssessorType,
                    type: project.assessment_development_type_master.DevelopmentTypeName,
                    status:(parseInt(project.Is_Completed) ===1?'Completed':'In-Progress')})
            })
            updateSyncDetails(4,moment().format('DD/MM/YYYY HH:mm:ss'));
            setProjectList(projects)
            if(callback)
                callback(projects)
        }
        else
        {
            alert(response.data.ErrorMessage);
        }

    })
    .catch(error => {
        
        alert('There was an error!' + error);
        
    });
}

export const setProjectList=(projectList:IProject[]) =>{ 
  
    set('project-info',JSON.stringify(projectList));
}

export const getProjectList=(callback:(projects:IProject[])=>void):void=>{

    get('project-info').then ( projects=>{
        if(projects)
        {
            callback(JSON.parse(projects as string))
        }
    })
    
}

export const getProjectHeader=(projectId:number,callback:(projects:IProject)=>void)=>{
    
    get('project-info').then ( projects=>{
        if(projects)
        {
            let lst = JSON.parse(projects as string);
            if (lst!==null)
            {
                for (var item of lst) {
                    if (parseInt(item.id) === projectId)
                    {
                        callback(item);
                        return;
                    }
                        
                }
            }

        }
    })

    

    return null;
}



export const downloadProjectSummary=(projectId:number, callback:(status:string)=>void):void=>
{
    axios.get(getMyAPIHost() + 'getassessmentprojectsummary?ProjectID='+projectId, { headers: { SessionId: getUserInfo().sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let projectWeightage:IProjectWeightage={
                id:projectId,
                externalWallApplicable: response.data.projectMasterViewModel.Is_ExternalWallApplicable,
                externalWorksApplicable: response.data.projectMasterViewModel.Is_ExternalWorksApplicable,
                roofApplicable: response.data.projectMasterViewModel.Is_RoofApplicable,
                fieldWindowWTTApplicable: response.data.projectMasterViewModel.Is_FieldWindowWTTApplicable,
                wetAreaWTTApplicable: response.data.projectMasterViewModel.Is_WetAreaWTTApplicable,
                architectWork:response.data.projectMasterViewModel.assessment_development_type_master.ArchitecturalWorksWeightage,
                meWork:response.data.projectMasterViewModel.assessment_development_type_master.MEWorksWeightage,
                minimumCompliance: response.data.projectMasterViewModel.assessment_development_type_master.MinimumCompliancePercentageThreshold
            };
            
            let weightage:IAssessmentWeightage[]=[];
            response.data.assessmentSummaryDetailModels.forEach((assessment:any)=>
            {  
                weightage.push({
                    typeId:assessment.AssessmentTypeID,
                    moduleId: assessment.AssessmentTypeModuleID,
                    moduleName: assessment.AssessmentTypeModuleName,
                    compliances: assessment.NoofCompliances,
                    checks: assessment.NoofChecks,
                    percentage: assessment.Percentage,
                    weightage: assessment.Weightage,
                    score: assessment.WeightedScore,
                    nonCompliance:assessment.MainNonCompliances
                })
                
            }) 
            set('project-weightage-'+projectId,JSON.stringify(projectWeightage));
            set('project-assessment-weightage-'+projectId,JSON.stringify(weightage));
            if(callback)
            {
                if (weightage.length>0)
                    callback(weightage.length + ' details Sync with Server');
                else
                    callback('No detail available to Sync');
                
                callback('REMOVE-SYNC');    
                callback('Process completed');
            }
        }
        else
        {
            callback(response.data.ErrorMessage);
        }

    })
    .catch(error => {
        if(error.response.status === 400) 
        {
            callback('Unauthorized request or Your session started in another device. ')
           
        }
        else       
            callback('There was an error!' + error);
        
    });
}


export const getProjectWeightage=(projectId:number, callback:(data:IProjectWeightage)=>void):void=>{

    get('project-weightage-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }        
    })
    
}


export const getAssessmentWeightage=(projectId:number, callback:(data:IAssessmentWeightage[])=>void):void=>{
    get('project-assessment-weightage-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }        
    })
}

export const updateAssessmentWeightage=(projectId:number,change:IAssessmentWeightage):void=>{
    get('project-assessment-weightage-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            let data:IAssessmentWeightage[]=JSON.parse(module as string);
            let changed=false;
            if (Array.isArray(data))
            {
                for (let i=0;i<data.length;i++)
                {
                    if (data[i].typeId===change.typeId && data[i].moduleId===change.moduleId){
                        data[i].compliances = change.compliances;
                        data[i].checks = change.checks;
                        data[i].percentage = change.percentage;
                        data[i].nonCompliance = change.nonCompliance;
                        data[i].score = data[i].weightage * data[i].percentage /100.00;
                        changed=true;
                        break;
                    }
                }
                if(changed)
                    set('project-assessment-weightage-'+projectId,JSON.stringify(data));
            }
        }        
    })
}

export const updateMultipleAssessmentWeightage=(projectId:number,changes:IAssessmentWeightage[]):void=>{
    get('project-assessment-weightage-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            let data:IAssessmentWeightage[]=JSON.parse(module as string);
            let changed=false;
            if (Array.isArray(data))
            {
                for (let j=0;j<changes.length;j++)
                {
                    for (let i=0;i<data.length;i++)
                    {
                        if (data[i].typeId===changes[j].typeId && data[i].moduleId===changes[j].moduleId){
                            data[i].compliances = changes[j].compliances;
                            data[i].checks = changes[j].checks;
                            data[i].percentage = changes[j].percentage;
                            data[i].nonCompliance = changes[j].nonCompliance;
                            data[i].score = data[i].weightage * data[i].percentage /100.00;
                            changed=true;
                            break;
                        }
                    }
    
                }
                if(changed)
                    set('project-assessment-weightage-'+projectId,JSON.stringify(data));
            }
        }        
    })
}

export const updateProject=(projectId:number,callback:(status:string)=>void):void=>
{
    let user = getUserInfo();
    let endPoint = 'assessmentprojectcompleted?ProjectID='+projectId + '&UserID='+user.userId;
    axios.post(getMyAPIHost() + endPoint,{}, {headers: { SessionId: user.sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            callback('Projected details updated')
        }
        else
        {
            callback('There was an error! ' + response.status);
        }

    })
    .catch(error => {
        
        if(error.response.status === 400) 
        {
            callback('Unauthorized request or Your session started in another device.')
           
        }
        else       
            callback('There was an error!' + error);
        
    });
}


export const getProjectReport=(projectId:number,callback:(status:string)=>void):void=>
{
    let user = getUserInfo();
    let endPoint = 'PrintAssessmentSummaryReportToPdf?ProjectID='+projectId + '&SessionId='+user.sessionID;
    let host = getMyAPIHost();
    host = 'https://buildqas-global.com/Report/'
    axios.get(host + endPoint)
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            callback('Projected details updated')
        }
        else
        {
            callback('There was an error! ' + response.status);
        }

    })
    .catch(error => {
        
        if(error.response.status === 400) 
        {
            callback('Unauthorized request or Your session started in another device.')
           
        }
        else       
            callback('There was an error!' + error);
        
    });
}
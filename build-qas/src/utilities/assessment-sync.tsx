import { addOrupdateAssessment, AssessmentTypes, deletionAssessment, IAssessmentKey } from "./assessment-functions";
import { downloadInternalFinishes, getInternalFinishes, IInternalFinishes } from "./internal-finishes-functions";
import { removeSyncUploadDetails } from "./master-functions";

interface IAssessmentSync {
    moduleId:number;
    moduleName:string;
    projectId:number;
    projectName:string;
    key:string;
    path:string;
}

class AssessmentSync {

    assessment:IAssessmentSync;
    detailAdd:any[];
    callBack:any;
    constructor()
    {
        this.assessment = {
            moduleId:0,
            moduleName:'',
            projectId:0,
            projectName:'',
            key:'',
            path:''
        }

        this.detailAdd=[];
    }
    
    public doSync=(assessmentKey:IAssessmentKey,callback:(message:string)=>void) =>{

        this.assessment.moduleId=assessmentKey.moduleId;
        this.assessment.moduleName = assessmentKey.moduleName;
        this.assessment.projectId = assessmentKey.projectId;
        this.callBack = callback;
        if (this.assessment.moduleId === AssessmentTypes.InternalFinishes)
            deletionAssessment('deleteinternalfinishes',assessmentKey.key,this.onUpdateStatus);
        else if (this.assessment.moduleId === AssessmentTypes.ExternalWall)
            deletionAssessment('deleteexternalwall',assessmentKey.key,this.onUpdateStatus);
        else if (this.assessment.moduleId === AssessmentTypes.ExternalWork)
            deletionAssessment('deleteexternalworks',assessmentKey.key,this.onUpdateStatus);
        else if (this.assessment.moduleId === AssessmentTypes.RoofConsctruction)
            deletionAssessment('deleteroofconstruction',assessmentKey.key,this.onUpdateStatus);
            /*
        else if (this.assessment.moduleId === AssessmentTypes.FieldWindow)
        { 
            getWallMaster(this.onWallMasterLoad);
        }
        */
        else if (this.assessment.moduleId === AssessmentTypes.WetArea)
            deletionAssessment('deletewetareawatertightnesstest',assessmentKey.key,this.onUpdateStatus);

    }

    
    onUpdateStatus(processStatus:string)
    {   
        if(processStatus==='START-UPDATE')
        {
            if (this.assessment.moduleId === AssessmentTypes.InternalFinishes)
                getInternalFinishes(this.assessment.projectId,this.onSyncInternalFinishes)
        }
        else if(processStatus==='START-ADD')
        {
            if (this.assessment.moduleId === AssessmentTypes.InternalFinishes && this.detailAdd.length>0)
                addOrupdateAssessment('saveinternalfinishes','ADD',this.detailAdd, this.onUpdateStatus);        
            else
            {
                this.onUpdateStatus('No detail available to add');
                this.onUpdateStatus('START-DOWNLOAD');
            }       
        }
        else if(processStatus==='START-DOWNLOAD') 
        {
            if (this.assessment.moduleId === AssessmentTypes.InternalFinishes)
                downloadInternalFinishes(this.assessment.projectId, this.onUpdateStatus);
        }
        else if(processStatus==='REMOVE-SYNC')
        {
            removeSyncUploadDetails(this.assessment.projectId,'',this.assessment.moduleName); 
            this.callBack(true,'Completed')
        }
        else
        {
            this.callBack(processStatus)
        }    
    }
    

    onSyncInternalFinishes(internal:IInternalFinishes[]|string)
    {
        if(Array.isArray(internal))
        {
            let rowFullList=internal as IInternalFinishes[];
            let internalFinishesAdd:any=[];
            let internalFinishesUpdate:any=[];
                
            if(rowFullList.length>0)
            {
                for(let i=0;i<rowFullList.length;i++)
                {
                    if (rowFullList[i].status!==0)
                    {
                        let detailResult:any=[]
                        
                        for (let j=0;j<rowFullList[i].details.length;j++)
                        {
                            detailResult.push({
                                AssessmentIFDetailID: rowFullList[i].details[j].id,
                                AssessmentTypeModuleProcessID: rowFullList[i].details[j].pId,
                                Result: rowFullList[i].details[j].result,
                                RowNo: rowFullList[i].details[j].row    
                            })
                        }

                        let detail={
                            AssessmentIFID: rowFullList[i].status===1? 0:rowFullList[i].id,
                            ProjectID: this.assessment.projectId,
                            AssessmentDate: rowFullList[i].date,
                            Block_Unit: rowFullList[i].block,
                            LocationID: rowFullList[i].lId,LocationName:rowFullList[i].lName,
                            MobileAssessmentIFID:  rowFullList[i].id,
                            BatchID: "",
                            Status: rowFullList[i].status,
                            CreatedOrUpdatedByUserId: 0,
                            AssessmentInternalFinishesTransDetailMobileViewModels:detailResult
                        };
                        if (rowFullList[i].status===1)
                        {
                            internalFinishesAdd.push(detail);
            
                        }
                        else if (rowFullList[i].status===2)
                            internalFinishesUpdate.push(detail);    
                    }
                }
                this.detailAdd=internalFinishesAdd;
                
                if (internalFinishesUpdate.length>0)
                    addOrupdateAssessment('updateinternalfinishes','UPDATE',internalFinishesUpdate, this.onUpdateStatus);        
                else
                {
                    this.onUpdateStatus('No detail available to update');
                    this.onUpdateStatus('START-ADD');
                }    
            }
            else
            {
                this.onUpdateStatus('No detail available to update');
                this.onUpdateStatus('No detail available to add');
                downloadInternalFinishes(this.assessment.projectId, this.onUpdateStatus);
            }
                
        }
        else 
            this.onUpdateStatus(internal as string)
    }


        
}

export const SyncWorker = new AssessmentSync();
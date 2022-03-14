import axios from "axios";
import { get, set  } from 'idb-keyval';
import { getMyAPIHost } from "./master-functions";
import { getUserInfo } from "./user-functions";


export interface IExternalWork{
    id: number,
    appId:number,
    date:string,
    remark:string,
    lId:number,
    lName:string,
    drawing:string,
    status:number,
    process?:string[],
    details:IDetail[]
}

export interface IDetail{
    id: number,
    pId: number,
    result: number,
    row: number
}


export const getExternalWork=(projectId:number, callback:(work:IExternalWork[])=>void):void=>{

    get('external-work-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }
        else 
            callback([])
    })
    
}
export const setExternalWork=(projectId:number, work:IExternalWork[]):void=>{

    set('external-work-'+projectId,JSON.stringify(work));
    
}
export const downloadExternalWork=(projectId:number, callback:(status:string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getexternalworksdetail?ProjectID='+projectId, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            translateInExternalWork(projectId, response.data,callback);
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(error.response.status === 400) 
        {
            callback('Unauthorized request or Your session started in another device.')
           
        }
        else
            callback('Download error: '+ error)


    });
}


const translateInExternalWork=(projectId:number, data:any[], callback:(status:string)=>void)=>
{
    let work:IExternalWork[] = [];

    data.forEach((module:any)=>{
        let workdetail:IExternalWork = {appId:0,id:module.AssessmentEWKID,date:module.AssessmentDate,remark:module.Remarks,
            lId:module.LocationID,lName:module.LocationName,drawing:module.Drawing_Image,status:module.Status,details:[]};
        if (Array(module.AssessmentExternalWorksTransDetailMobileViewModels))
        {
            module.AssessmentExternalWorksTransDetailMobileViewModels.forEach((detail:any)=>{
                workdetail.details.push({id:detail.AssessmentEWKDetailID,pId:detail.AssessmentTypeModuleProcessID,
                result:detail.Result,row:detail.RowNo})
            });
        }
        if(workdetail.details.length>0)
            work.push(workdetail)
    });

    set('external-work-'+projectId,JSON.stringify(work));
    if(callback)
    {
        if (work.length>0)
            callback(work.length + ' details Sync with Server');
        else
            callback('No detail available to Sync');
        
        callback('REMOVE-SYNC');    
        callback('Process completed');
    }
}


export const markForDeletion=(projectId:number,deleted:IExternalWork):void=>{

    get('external-work-deleted'+projectId).then ( assessment=>{
        let toBeDeleted:any=[];
        if(assessment!==undefined)
        {
            toBeDeleted = JSON.parse(assessment as string);
        }
        toBeDeleted.push({AssessmentEWKID:deleted.id});
        set('external-work-deleted'+projectId,JSON.stringify(toBeDeleted))
    })
}

import axios from "axios";
import { get, set  } from 'idb-keyval';
import { getMyAPIHost } from "./master-functions";
import { getUserInfo } from "./user-functions";


export interface IWetArea{
    id: number,
    date:string,
    block:string,
    drawing:string,
    status:number,
    others:string,
    details:IDetail[]
}

export interface IDetail{
    id: number,
    pId: number,
    result: number,
    row: number
}

export const getWetArea=(projectId:number, callback:(wall:IWetArea[])=>void):void=>{

    get('wet-area-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }
        else 
            callback([])
    })
    
}
export const setWetArea=(projectId:number, wall:IWetArea[]):void=>{

    set('wet-area-'+projectId,JSON.stringify(wall));
    
}
export const downloadWetArea=(projectId:number, callback:(status:string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getwetareawatertightnesstestdetail?ProjectID='+projectId, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            translateInWetArea(projectId, response.data,callback);
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
            callback('Unauthorized request or Your session started in another device. Please login to continue')
           
        }
        else
            callback('Download error: '+ error)


    });
}

const translateInWetArea=(projectId:number, data:any[], callback:(status:string)=>void)=>
{
    let wall:IWetArea[] = [];

    data.forEach((module:any)=>{
        let walldetail:IWetArea = {id:module.AssessmentWAWTTID,date:module.AssessmentDate,block:module.Block_Unit,
            others:module.Other_Result,drawing:module.Drawing_Image,status:module.Status,details:[]};
        if (Array.isArray(module.AssessmentWetAreaWaterTightnessTestTransDetailMobileViewModels))
        {
            module.AssessmentWetAreaWaterTightnessTestTransDetailMobileViewModels.forEach((detail:any)=>{
                walldetail.details.push({id:detail.AssessmentWAWTTDetailID,pId:detail.AssessmentTypeModuleProcessID,
                result:detail.Result,row:detail.RowNo})
            });
        }

        if (Array.isArray(module.AssessmentWetAreaWaterTightnessTestTransDetailResultMobileViewModels))
        {
            module.AssessmentWetAreaWaterTightnessTestTransDetailResultMobileViewModels.forEach((detail:any)=>{
                walldetail.details.push({id:detail.AssessmentWAWTTDetailResultID,pId:detail.AssessmentTypeModuleProcessID,
                result:detail.Result,row:detail.AssessmentWAWTTResultID})
            });
        }

        if(walldetail.details.length>0)
            wall.push(walldetail)
    });

    set('wet-area-'+projectId,JSON.stringify(wall));
    if(callback)
    {
        if (wall.length>0)
            callback(wall.length + ' details Sync with Server');
        else
            callback('No detail available to Sync');
        
        callback('REMOVE-SYNC');    
        callback('Process completed');
    }
}


export const markForDeletion=(projectId:number,deleted:IWetArea):void=>{

    get('wet-area-deleted'+projectId).then ( assessment=>{
        let toBeDeleted:any=[];
        if(assessment!==undefined)
        {
            toBeDeleted = JSON.parse(assessment as string);
        }
        toBeDeleted.push({AssessmentWAWTTID:deleted.id});
        set('wet-area-deleted'+projectId,JSON.stringify(toBeDeleted))
    })
}

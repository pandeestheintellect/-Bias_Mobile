import axios from "axios";
import { get, set } from 'idb-keyval';
import { getMyAPIHost } from "./master-functions";
import { getUserInfo } from "./user-functions";


export interface IRoofConstruction{
    id: number,
    date:string,
    block:string,
    lId:number,
    lName:string,
    drawing:string,
    status:number,
    details:IDetail[]
}

export interface IDetail{
    id: number,
    pId: number,
    result: number,
    row: number
}


export const getRoofConstruction=(projectId:number, callback:(roof:IRoofConstruction[])=>void):void=>{

    get('roof-construction-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }
        else 
            callback([])
    })
    
}
export const setRoofConstruction=(projectId:number, roof:IRoofConstruction[]):void=>{

    set('roof-construction-'+projectId,JSON.stringify(roof));
    
}
export const downloadRoofConstruction=(projectId:number, callback:(status:string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getroofconstructiondetail?ProjectID='+projectId, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            translateInRoofConstruction(projectId, response.data,callback);
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
            callback('Unauthorized request or Your session started in another device. ')
           
        }
        else
            callback('Download error: '+ error)


    });
}

const translateInRoofConstruction=(projectId:number, data:any[], callback:(status:string)=>void)=>
{
    let roof:IRoofConstruction[] = [];

    data.forEach((module:any)=>{
        let roofdetail:IRoofConstruction = {id:module.AssessmentRFCID,date:module.AssessmentDate,block:module.Block_Unit,
            lId:module.LocationID,lName:module.LocationName,drawing:module.Drawing_Image,status:module.Status,details:[]};
        if (Array(module.AssessmentRoofConstructionTransDetailMobileViewModels))
        {
            module.AssessmentRoofConstructionTransDetailMobileViewModels.forEach((detail:any)=>{
                roofdetail.details.push({id:detail.AssessmentRFCDetailID,pId:detail.AssessmentTypeModuleProcessID,
                result:detail.Result,row:detail.RowNo})
            });
        }
        if(roofdetail.details.length>0)
            roof.push(roofdetail)
    });

    set('roof-construction-'+projectId,JSON.stringify(roof));
    if(callback)
    {
        if (roof.length>0)
            callback(roof.length + ' details Sync with Server');
        else
            callback('No detail available to Sync');
        
        callback('REMOVE-SYNC');    
        callback('Process completed');
    }
}


export const markForDeletion=(projectId:number,deleted:IRoofConstruction):void=>{

    get('roof-construction-deleted'+projectId).then ( assessment=>{
        let toBeDeleted:any=[];
        if(assessment!==undefined)
        {
            toBeDeleted = JSON.parse(assessment as string);
        }
        toBeDeleted.push({AssessmentRFCID:deleted.id});
        set('roof-construction-deleted'+projectId,JSON.stringify(toBeDeleted))
    })
}

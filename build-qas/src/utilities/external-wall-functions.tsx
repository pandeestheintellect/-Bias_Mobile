import axios from "axios";
import { get, set  } from 'idb-keyval';
import { getMyAPIHost } from "./master-functions";
import { getUserInfo } from "./user-functions";


export interface IExternalWall{
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


export const getExternalWall=(projectId:number, callback:(wall:IExternalWall[])=>void):void=>{

    get('external-wall-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }        
        else 
            callback([])
    })
    
}
export const setExternalWall=(projectId:number, wall:IExternalWall[]):void=>{

    set('external-wall-'+projectId,JSON.stringify(wall));
    
}
export const downloadExternalWall=(projectId:number, callback:(status:string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getexternalwalldetail?ProjectID='+projectId, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            translateInExternalWall(projectId, response.data,callback);
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

const translateInExternalWall=(projectId:number, data:any[], callback:(status:string)=>void)=>
{
    let wall:IExternalWall[] = [];

    data.forEach((module:any)=>{
        let walldetail:IExternalWall = {id:module.AssessmentEWID,date:module.AssessmentDate,block:module.Block_Unit,
            lId:module.LocationID,lName:module.LocationName,drawing:module.Drawing_Image,status:module.Status,details:[]};
        if (Array(module.AssessmentExternalWallTransDetailMobileViewModels))
        {
            module.AssessmentExternalWallTransDetailMobileViewModels.forEach((detail:any)=>{
                walldetail.details.push({id:detail.AssessmentEWDetailID,pId:detail.AssessmentTypeModuleProcessID,
                result:detail.Result,row:detail.RowNo})
            });
        }
        if(walldetail.details.length>0)
            wall.push(walldetail)
   });

    set('external-wall-'+projectId,JSON.stringify(wall));

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

export const markForDeletion=(projectId:number,deleted:IExternalWall):void=>{

    get('external-wall-deleted'+projectId).then ( assessment=>{
        let toBeDeleted:any=[];
        if(assessment!==undefined)
        {
            toBeDeleted = JSON.parse(assessment as string);
        }
        toBeDeleted.push({AssessmentEWID:deleted.id});
        set('external-wall-deleted'+projectId,JSON.stringify(toBeDeleted))
    })
}

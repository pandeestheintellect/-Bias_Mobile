import axios from "axios";
import { get, set  } from 'idb-keyval';
import { IDirection, IJoint, ILeak, IWall, IWindow } from "../models/assessement";
import { getMyAPIHost } from "./master-functions";
import { getUserInfo } from "./user-functions";


export interface IFieldWindow{
    id: number,
    date:string,
    block:string,
    wallId:number,
    wallName:string,
    windowId:number,
    windowName:string,
    jointId:number,
    jointName:string,
    directionId:number,
    directionName:string,
    leakId:number,
    leakName:string,
    result:number,
    status:number,
    drawing:string,
}
 
export interface IDetail{
    id: number,
    pId: number,
    result: number,
    row: number
}


export const getFieldWindow=(projectId:number, callback:(fieldWindow:IFieldWindow[])=>void):void=>{

    get('field-window-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }
        else 
            callback([])
    })
    
}
export const setFieldWindow=(projectId:number, fieldWindow:IFieldWindow[]):void=>{

    set('field-window-'+projectId,JSON.stringify(fieldWindow));
    
}
export const downloadFieldWindow=(projectId:number,wall:IWall[],window:IWindow[],joint:IJoint[],leak:ILeak[],direction:IDirection[], callback:(status:string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getfieldwindowwatertightnesstestdetail?ProjectID='+projectId, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            translateInFieldWindow(projectId,wall,window,joint,leak,direction, response.data,callback);
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


const translateInFieldWindow=(projectId:number,wall:IWall[],window:IWindow[],joint:IJoint[],leak:ILeak[],direction:IDirection[], data:any[], callback:(status:string)=>void)=>
{
    let fieldWindow:IFieldWindow[] = [];

    data.forEach((module:any)=>{
        let fieldWindowdetail:IFieldWindow = {id:module.AssessmentFWWTTID,date:module.AssessmentDate,block:module.Block_Unit,
            wallId:module.AssessmentWallID,wallName:wall.filter(e=>e.id===parseInt(module.AssessmentWallID) )[0].name,
            windowId:module.AssessmentWindowID,windowName:window.filter(e=>e.id===parseInt(module.AssessmentWindowID))[0].name,
            jointId:module.AssessmentJointID,jointName:joint.filter(e=>e.id===parseInt(module.AssessmentJointID))[0].name,
            directionId:module.AssessmentDirectionID,directionName:direction.filter(e=>e.id===parseInt(module.AssessmentDirectionID))[0].name,
            leakId:module.AssessmentLeakID,leakName:leak.filter(e=>e.id===parseInt(module.AssessmentLeakID))[0].name,
            status:module.Status,result:module.Result,drawing:module.Drawing_Image};
        
        fieldWindow.push(fieldWindowdetail)
    });

    set('field-window-'+projectId,JSON.stringify(fieldWindow));
    if(callback)
    {
        if (fieldWindow.length>0)
            callback(fieldWindow.length + ' details Sync with Server');
        else
            callback('No detail available to Sync');
        
        callback('REMOVE-SYNC');    
        callback('Process completed');
    }
}


export const markForDeletion=(projectId:number,deleted:IFieldWindow):void=>{

    get('field-window-deleted'+projectId).then ( assessment=>{
        let toBeDeleted:any=[];
        if(assessment!==undefined)
        {
            toBeDeleted = JSON.parse(assessment as string);
        }
        toBeDeleted.push({AssessmentFWWTTID:deleted.id});
        set('field-window-deleted'+projectId,JSON.stringify(toBeDeleted))
    })
}

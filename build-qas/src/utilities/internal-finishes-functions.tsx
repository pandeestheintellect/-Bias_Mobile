import axios from "axios";
import { get, set  } from 'idb-keyval';
import { IAssessmentLocation } from "../models/assessement";
import { getMyAPIHost } from "./master-functions";
import { getUserInfo } from "./user-functions";

export interface IInternalFinishes{
    id: number,
    date:string,
    block:string,
    lId:number,
    lName:string,
    lType:string,
    status:number,
    details:IDetail[]
}

export interface IDetail{
    id: number,
    pId: number,
    result: number,
    row: number
}


export const getInternalFinishes=(projectId:number, callback:(wall:IInternalFinishes[])=>void):void=>{

    get('internal-finishes-'+projectId).then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }
        else 
            callback([])
    })
    
}
export const setInternalFinishes=(projectId:number, wall:IInternalFinishes[]):void=>{

    set('internal-finishes-'+projectId,JSON.stringify(wall));
    
}
export const downloadInternalFinishes=(projectId:number, callback:(status:string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getInternalfinishesdetail?ProjectID='+projectId, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            translateInInternalFinishes(projectId, response.data,callback);
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


const translateInInternalFinishes=(projectId:number, data:any[], callback:(status:string)=>void)=>
{
    let wall:IInternalFinishes[] = [];
    let locations:IAssessmentLocation[];
    let location:IAssessmentLocation[];

    get('location-master').then ( module=>{
        if(module!==undefined)
        {
            locations=JSON.parse(module as string);

            data.forEach((module:any)=>{
                let walldetail:IInternalFinishes = {id:module.AssessmentIFID,date:module.AssessmentDate,block:module.Block_Unit,
                    lId:module.LocationID,lName:module.LocationName,status:module.Status,lType:'', details:[]};
                    
                location=locations.filter((e)=>e.id===walldetail.lId)
                walldetail.lType=location[0].type;
                /*    
                if(module.LocationName.endsWith('(P)'))
                    walldetail.lType='P';
                else if(module.LocationName.endsWith('(S)'))
                    walldetail.lType='S';
                else if(module.LocationName.endsWith('(C)'))
                    walldetail.lType='C';
                */
               
                if (Array.isArray(module.AssessmentInternalFinishesTransDetailMobileViewModels))
                {
                    module.AssessmentInternalFinishesTransDetailMobileViewModels.forEach((detail:any)=>{
                        walldetail.details.push({id:detail.AssessmentIFDetailID,pId:detail.AssessmentTypeModuleProcessID,
                        result:detail.Result,row:detail.RowNo})
                    });
                }
                if(walldetail.details.length>0)
                    wall.push(walldetail)
            });

            set('internal-finishes-'+projectId,JSON.stringify(wall));
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
        else
            callback('Details not available for Location, Please sync Location master with server.')
    })

        
}

export const markForDeletion=(projectId:number,deleted:IInternalFinishes):void=>{

    get('internal-finishes-deleted'+projectId).then ( assessment=>{
        let toBeDeleted:any=[];
        if(assessment!==undefined)
        {
            toBeDeleted = JSON.parse(assessment as string);
        }
        toBeDeleted.push({AssessmentIFID:deleted.id});
        set('internal-finishes-deleted'+projectId,JSON.stringify(toBeDeleted))
        
    })
}

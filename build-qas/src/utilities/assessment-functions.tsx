import axios from "axios";
import { get, del, set  } from 'idb-keyval';
import { getMyAPIHost, uploadSyncUploadDetails } from "./master-functions";
import { getUserInfo } from "./user-functions";

export enum AssessmentTypes {
    InternalFinishes = 1,
    ExternalWall=2,
    ExternalWork=3,
    RoofConsctruction=4,
    FieldWindow=5,
    WetArea=6
}


export interface IAssessmentKey {
    moduleId:number;
    moduleName:string;
    projectId:number;
    projectName:string;
    key:string;
}



export const addOrupdateAssessment=(path:string,type:string,assessments:any[], callback:(status:string)=>void):void=>
{
    axios.post(getMyAPIHost() +path,assessments, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200)
        {
            if(callback)
            {
                if(type==='UPDATE')
                {
                    callback(assessments.length + ' details updated')
                    callback('START-ADD');
                }
                else {
                    callback(assessments.length + ' details add')
                    callback('START-DOWNLOAD');
                }
            }
        }
        else
        {
            if(callback)
            {
                if(type==='UPDATE')
                {
                    callback('Details updation failed')
                    callback('START-ADD');
                }
                else 
                {
                    callback('Details addition failed')
                    callback('START-DOWNLOAD');
                }
            }
        }
    })
    .catch(error => {
        if(error.response.status === 400) 
        {
            callback('Unauthorized request or Your session started in another device.')
        
        }
        else       
        {
            if(type==='UPDATE')
            {
                callback('Update error: '+ error)
                callback('START-ADD');
            }
            else 
            {
                callback('Add error: '+ error)
                callback('START-DOWNLOAD');
            }
        }
    });
    
}

export const deletionAssessment=(path:string,store:string,callback:(status:string)=>void):void=>{

    get(store).then ( wall=>{
        let toBeDeleted:any=[];
        if(wall!==undefined)
        {
            toBeDeleted = JSON.parse(wall as string);
            axios.post(getMyAPIHost() + path,toBeDeleted, { headers: { SessionId: getUserInfo().sessionID }})
            .then(response => 
            {
                if (response.status===200 && response.data)
                {
                    callback(toBeDeleted.length +' details removed');
                    callback('START-UPDATE');
                    del (store);
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
                    callback('Error:Deletion error: '+ error);

            });
        }
        else
        {
            callback('No detail available to be removed');
            callback('START-UPDATE');
        }
    })
}



export const markForDeletion=(key:IAssessmentKey,id:number):void=>{

    get(key.key).then ( assessment=>{
        let toBeDeleted:any=[];
        if(assessment!==undefined)
        {
            toBeDeleted = JSON.parse(assessment as string);
        }
        if (key.moduleId===AssessmentTypes.InternalFinishes)
            toBeDeleted.push({AssessmentIFID:id});
        else if (key.moduleId===AssessmentTypes.ExternalWall)
            toBeDeleted.push({AssessmentEWID:id});
        else if (key.moduleId===AssessmentTypes.ExternalWork)
            toBeDeleted.push({AssessmentEWKID:id});
        else if (key.moduleId===AssessmentTypes.RoofConsctruction)
            toBeDeleted.push({AssessmentRFCID:id});
        else if (key.moduleId===AssessmentTypes.FieldWindow)
            toBeDeleted.push({AssessmentFWWTTID:id});
        else if (key.moduleId===AssessmentTypes.WetArea)
            toBeDeleted.push({AssessmentWAWTTID:id});

        set(key.key,JSON.stringify(toBeDeleted))
        uploadSyncUploadDetails(key.projectId,key.projectName,key.moduleName);

        if (getUserInfo().isOffline===true)
        {
            storeOfflineActivity(key);
        }
    })
}

export const markForUpdate=(key:IAssessmentKey, assessements:any[]):void=>{

    set(key.key,JSON.stringify(assessements));

    uploadSyncUploadDetails(key.projectId,key.projectName,key.moduleName);

    if (getUserInfo().isOffline===true)
    {
        storeOfflineActivity(key);
    }
}

export const storeOfflineActivity=(key:IAssessmentKey):void=>
{
    let user = getUserInfo();

    get('assessment-offline-activity-'+user.userId).then ( activities=>{
        let offlineActivity:IAssessmentKey[]=[];
        
        let isFound:any = false;

        if(activities!==undefined)
        {
            offlineActivity = JSON.parse(activities as string);
        }

        offlineActivity.forEach(activity=>{
            if (activity.key===key.key)
            {
                isFound=true;
                return;
            }
        })

        if(isFound === false)
            offlineActivity.push(key);

        set('assessment-offline-activity-'+user.userId,JSON.stringify(offlineActivity))
    })
}

export const onSyncOfflineActivity=(callback:(status:string)=>void):void=>
{

    let user = getUserInfo();

    get('assessment-offline-activity-'+user.userId).then ( activities=>{
        
        if(activities!==undefined)
        {
            callback(activities as string)
        }
        else
            callback('No activity found to sync')
    })
}

export const onOfflineActivitySyncCompleted=():void=>
{

    let user = getUserInfo();
    del('assessment-offline-activity-'+user.userId);
}



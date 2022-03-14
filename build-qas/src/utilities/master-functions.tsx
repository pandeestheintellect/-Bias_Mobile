import axios from "axios";
import { del, get, set } from 'idb-keyval';
import { IAssessmentLocation, IAssessmentModule, IAssessmentModuleProcess, IDirection, IJoint, ILeak, IWall, IWindow } from "../models/assessement";
import moment from "moment";
import { AssessmentTypes } from "./assessment-functions";
import { getUserInfo } from "./user-functions";

export interface ISyncDetails {
    modulesDateTime:string;
    locationDateTime:string;
    processDateTime:string;
    assessmentDateTime:string;
    jointDateTime:string;
    leakDateTime:string;
    wallDateTime:string;
    windowDateTime:string;
}

export interface ISyncUploadDetails {
    projectId:number;
    name:string;
    module:string;
    firstDateTime:string;
    lastDateTime:string;
}


export interface IBlocks {
    internalFinishes:string;
    externalWall:string;
    externalWork:string;
    fieldWindow:string;
    roofConstruction:string;
    wetArea:string;
}


export const getMyAPIHost=():string=>{
    return 'https://buildqas-global.com/api/v1/mobilelogin/';
    //return '/api/v1/mobilelogin/';
}

export const getVersion=():string =>{
    return '1.00'
}

export const checkOnline1=(callback:(isOnline:boolean)=>void):void=>
{
    if(navigator.onLine)
    {
        callback(true)
    }
    else
        callback(false)
}

export const checkOnline=(callback:(isOnline:boolean)=>void):void=>
{
    if(navigator.onLine)
    {
        const webPing = setInterval(
            () => {

                try
                { 
                    
                    fetch('//google.com', {
                        mode: 'no-cors',
                        })
                        
                      .then(() => {
                        clearInterval(webPing);
                        callback(true);
                      })
                      
                      .catch(() => 
                      {
                          console.log('e')
                        clearInterval(webPing);
                        callback(false)
                      })

                }
                catch {
                    console.log('e1')
                    clearInterval(webPing);
                    callback(false)
                }
              
            }, 1000);
    }
    else
        callback(false)
}



export const getSyncDetails=(callback:(details:ISyncDetails)=>void):void=>{

    get('sync-time').then ( module=>{
        let syn:ISyncDetails;
        if(module!==undefined)
        {
            syn = JSON.parse(module as string);
        }
        else
        {
            syn = {
                modulesDateTime:'',
                locationDateTime:'',
                processDateTime:'',
                assessmentDateTime:'',
                jointDateTime:'',
                leakDateTime:'',
                wallDateTime:'',
                windowDateTime:''
            }
            
        }
        if(callback)
            callback(syn)
    })
}

export const updateSyncDetails=(option:number,optionDateTime:string):void=>{

    get('sync-time').then ( module=>{
        let syn:ISyncDetails;
        if(module!==undefined)
        {
            syn = JSON.parse(module as string);
        }
        else
        {
            syn = {
                modulesDateTime:'',
                locationDateTime:'',
                processDateTime:'',
                assessmentDateTime:'',
                jointDateTime:'',
                leakDateTime:'',
                wallDateTime:'',
                windowDateTime:''
            }
            
        }
        
        updateSync(syn,option,optionDateTime);
        set('sync-time',JSON.stringify(syn))
    })
}

export const getSyncUploadDetails=(callback:(details:ISyncUploadDetails[])=>void):void=>{

    get('sync-upload').then ( module=>{
        let syn:ISyncUploadDetails[]=[];
        if(module!==undefined)
        {
            syn = JSON.parse(module as string);
        }
        if(callback)
            callback(syn)
    })
}


export const uploadSyncUploadDetails=(id:number,projectName:string,moduleName:string):void=>{

    get('sync-upload').then ( module=>{
        let syn:ISyncUploadDetails[]=[];
        if(module!==undefined)
        {
            syn = JSON.parse(module as string);
        }
        if(syn.length===0)
        {
            syn.push({projectId:id,name:projectName,module:moduleName,firstDateTime:moment().format('DD/MM/YYYY HH:mm:ss'),lastDateTime:moment().format('DD/MM/YYYY HH:mm:ss')});
        }
        else
        {
            let toAdd=true;
            let synIndex=0;
            for(synIndex=0;synIndex<syn.length;synIndex++)
            {
                if(syn[synIndex].projectId===id && syn[synIndex].module===moduleName)
                {
                    toAdd=false;
                    break;
                }
                
            }
            if(toAdd)
                syn.push({projectId:id,name:projectName,module:moduleName,firstDateTime:moment().format('DD/MM/YYYY HH:mm:ss'),lastDateTime:moment().format('DD/MM/YYYY HH:mm:ss')});
            else
                syn[synIndex].lastDateTime= moment().format('DD/MM/YYYY HH:mm:ss');  
        }

        set('sync-upload',JSON.stringify(syn))
    })
}

export const removeSyncUploadDetails=(id:number,projectName:string,moduleName:string):void=>{

    get('sync-upload').then ( module=>{
        let syn:ISyncUploadDetails[]=[];
        let synNew:ISyncUploadDetails[]=[];

        if(module!==undefined)
        {
            syn = JSON.parse(module as string);
        }
        if(syn.length>0)
        {
            let synIndex=0;
            for(synIndex;synIndex<syn.length;synIndex++)
            {
                if(!(syn[synIndex].projectId===id && syn[synIndex].module===moduleName))
                    synNew.push(syn[synIndex])
                
            }
        }
        if(synNew.length>0)
            set('sync-upload',JSON.stringify(synNew))
        else
            del('sync-upload')
    })
}

const updateSync=(syn:ISyncDetails,option:number,optionDateTime:string):void=>{
    if(option===1)
        syn.modulesDateTime=optionDateTime;
    else if(option===2)
        syn.locationDateTime=optionDateTime;
    else if(option===3)
        syn.processDateTime=optionDateTime;
    else if(option===4)
        syn.assessmentDateTime=optionDateTime;
    else if(option===5)
        syn.jointDateTime=optionDateTime;
    else if(option===6)
        syn.leakDateTime=optionDateTime;
    else if(option===7)
        syn.wallDateTime=optionDateTime;
    else if(option===8)
        syn.windowDateTime=optionDateTime;

}

export const getBlockDetail=(option:number,callback:(detail:string)=>void):void=>{

    get('last-block-entry').then ( module=>{
        let det:IBlocks;
        if(module!==undefined)
        {
            det = JSON.parse(module as string);
        }
        else
        {
            det = {
                internalFinishes:'',
                externalWall:'',
                externalWork:'',
                fieldWindow:'',
                roofConstruction:'',
                wetArea:''
            }
        }
        
        if (option===AssessmentTypes.InternalFinishes)
            callback(det.internalFinishes)
        else if (option===AssessmentTypes.ExternalWall)
            callback(det.externalWall)
        else if (option===AssessmentTypes.ExternalWork)
            callback(det.externalWork)
        else if (option===AssessmentTypes.FieldWindow)
            callback(det.fieldWindow)
        else if (option===AssessmentTypes.RoofConsctruction)
            callback(det.roofConstruction)
        else if (option===AssessmentTypes.WetArea)
            callback(det.wetArea)

    })
}

export const updateBlockDetails=(option:number,detail:string):void=>{

    get('last-block-entry').then ( module=>{
        let det:IBlocks;
        if(module!==undefined)
        {
            det = JSON.parse(module as string);
        }
        else
        {
            det = {
                internalFinishes:'',
                externalWall:'',
                externalWork:'',
                fieldWindow:'',
                roofConstruction:'',
                wetArea:''
            }
            
        }
        
        if (option===AssessmentTypes.InternalFinishes)
            det.internalFinishes = detail
        else if (option===AssessmentTypes.ExternalWall)
            det.externalWall= detail
        else if (option===AssessmentTypes.ExternalWork)
            det.externalWork= detail
        else if (option===AssessmentTypes.FieldWindow)
            det.fieldWindow= detail
        else if (option===AssessmentTypes.RoofConsctruction)
            det.roofConstruction= detail
        else if (option===AssessmentTypes.WetArea)
            det.wetArea= detail

        set('last-block-entry',JSON.stringify(det))
    })
}

export const getModuleMaster=(callback:(moduls:IAssessmentModule[]|string)=>void):void=>{

    get('module-master').then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }
        else
            callback('Details not available for module, Please sync Module master with server.')
    })
}

export const downloadModuleMaster=(callback:(moduleMaster:IAssessmentModule[]|string)=>void):void=>
{
    axios.get(getMyAPIHost() + 'getallmodules', { headers: { SessionId: getUserInfo().sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:IAssessmentModule[] = [];
            response.data.map((module:any)=>

                masters.push({id:module.AssessmentTypeModuleID,name:module.AssessmentTypeModuleShortName,
                    assessmentId:module.assessment_type_master.AssessmentTypeID,
                    assessmentName:module.assessment_type_master.AssessmentTypeName})
            );
       
            updateSyncDetails(1,moment().format('DD/MM/YYYY HH:mm:ss'));
            set('module-master',JSON.stringify(masters))
            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error)

    });
}


export const getModuleProcessMaster=(callback:(moduls:IAssessmentModuleProcess[]|string)=>void):void=>{

    get('module-process-master').then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }
        else
            callback('Details not available for Process, Please sync Process master with server.')
    })
    
}

export const downloadModuleProcessMaster=(callback:(moduleMaster:IAssessmentModuleProcess[]|string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getallmoduleprocess', { headers: { SessionId: getUserInfo().sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:IAssessmentModuleProcess[] = [];
            response.data.map((module:any)=>

                masters.push({id:module.AssessmentTypeModuleProcessID,name:module.AssessmentTypeModuleProcessName,
                    moduleId:module.assessment_type_module_master.AssessmentTypeModuleID,
                    moduleName:module.assessment_type_module_master.AssessmentTypeModuleShortName,
                    assessmentId:module.assessment_type_module_master.assessment_type_master.AssessmentTypeID,
                    assessmentName:module.assessment_type_module_master.assessment_type_master.AssessmentTypeName,
                    locationId:module.AssessmentTypeLocationID,locationName:module.assessment_type_location_master?.AssessmentTypeLocationName
                })
            );
            updateSyncDetails(3,moment().format('DD/MM/YYYY HH:mm:ss')); 
            set('module-process-master',JSON.stringify(masters))
            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error)

    });
}


export const getLocationMaster=(callback:(moduls:IAssessmentLocation[]|string)=>void):void=>{

    get('location-master').then ( module=>{
        if(module!==undefined)
        {
            callback(JSON.parse(module as string))
        }
        else
            callback('Details not available for Location, Please sync Location master with server.')
    })
    
}

export const downloadLocationMaster=(callback:(moduleMaster:IAssessmentLocation[]|string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getallassessmentlocations', { headers: { SessionId: getUserInfo().sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:IAssessmentLocation[] = [];
            response.data.map((module:any)=>

                masters.push({id:module.AssessmentTypeLocationID,name:module.AssessmentTypeLocationName,
                    type:module.AssessmentTypeLocationType,
                    assessmentId:module.assessment_type_master.AssessmentTypeID,
                    assessmentName:module.assessment_type_master.AssessmentTypeName})
            );
            updateSyncDetails(2,moment().format('DD/MM/YYYY HH:mm:ss'));
            set('location-master',JSON.stringify(masters))
            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error)

    });
}

export const getJointMaster=(callback:(jointMaster:IJoint[]|string)=>void):void=>{

    get('joint-master').then ( master=>{
        if(master!==undefined)
        {
            callback(JSON.parse(master as string))
        }
        else
            callback('Details not available for Joint, Please sync Joint master with server.')
    })
}

export const downloadJointMaster=(callback:(jointMaster:IJoint[]|string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getalljoints', { headers: { SessionId: getUserInfo().sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:IJoint[] = [];
            response.data.map((master:any)=>

                masters.push({id:master.AssessmentJointID,name:master.AssessmentJointName})
            );
       
            updateSyncDetails(5,moment().format('DD/MM/YYYY HH:mm:ss'));
            set('joint-master',JSON.stringify(masters))
            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error)

    });
}

export const getLeakMaster=(callback:(leakMaster:ILeak[]|string)=>void):void=>{

    get('leak-master').then ( master=>{
        if(master!==undefined)
        {
            callback(JSON.parse(master as string))
        }
        else
            callback('Details not available for Leak, Please sync Window master with server.')
    })
}

export const downloadLeakMaster=(callback:(leakMaster:ILeak[]|string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getallleaks', { headers: { SessionId: getUserInfo().sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:ILeak[] = [];
            response.data.map((master:any)=>

                masters.push({id:master.AssessmentLeakID,name:master.AssessmentLeakName})
            );
       
            updateSyncDetails(6,moment().format('DD/MM/YYYY HH:mm:ss'));
            set('leak-master',JSON.stringify(masters))
            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error)

    });
}

export const getWallMaster=(callback:(wallMaster:IWall[]|string)=>void):void=>{

    get('wall-master').then ( master=>{
        if(master!==undefined)
        {
            callback(JSON.parse(master as string))
        }
        else
            callback('Details not available for Wall, Please sync Wall master with server.')
    })
}

export const downloadWallMaster=(callback:(wallMaster:IWall[]|string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getallwalls', { headers: { SessionId: getUserInfo().sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:IWall[] = [];
            response.data.map((master:any)=>

                masters.push({id:master.AssessmentWallID,name:master.AssessmentWallName})
            );
       
            updateSyncDetails(7,moment().format('DD/MM/YYYY HH:mm:ss'));
            set('wall-master',JSON.stringify(masters))
            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error)

    });
}

export const getWindowMaster=(callback:(windowMaster:IWindow[]|string)=>void):void=>{

    get('window-master').then ( master=>{
        if(master!==undefined)
        {
            callback(JSON.parse(master as string))
        }
        else
            callback('Details not available for Window, Please sync Window master with server.')
    })
}

export const downloadWindowMaster=(callback:(windowMaster:IWindow[]|string)=>void):void=>
{
    axios.get(getMyAPIHost() +'getallwindows', { headers: { SessionId: getUserInfo().sessionID }} )
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:IWindow[] = [];
            response.data.map((master:any)=>

                masters.push({id:master.AssessmentWindowID,name:master.AssessmentWindowName})
            );
       
            updateSyncDetails(8,moment().format('DD/MM/YYYY HH:mm:ss'));
            set('window-master',JSON.stringify(masters))
            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error)

    });
}

export const getDirectionMaster=(callback:(directionMaster:IDirection[])=>void):void=>{
    let direction = [{id:1,name:'Horizontal'},{id:2,name:'Vertical'}]
    callback(direction)
}

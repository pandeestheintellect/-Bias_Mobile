import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from "moment";
import { ImageSourcePropType } from "react-native";
import { getAPIHost, INameId, showErrorToast, storeDataToStorage } from "./master-functions";
import { getUserInfo, IAppUser } from "./user-functions";

export interface IProject {
    id:number;    
    name:string;
    manager:INameId[];
    supervisor:INameId[];
    locations:INameId[];
    mandes:INameId[];
    others:INameId[];
    structurs:INameId[];
    rfwiDrawings:IImages[];
}

export interface IDefectDetail {
    id: number;no: string; defectRemarks:string;entryDate: string; status: string;mobileStatus:number,

    project:INameId; manager:INameId; trade:INameId; defect:INameId; location:INameId; subcontractor: INameId;
    approved?:IDefectStage; reDo?:IDefectStage; reDoDone?:IDefectStage; rectify?:IDefectStage; rework?:IDefectStage; complete?:IDefectStage;
    defectImages:IImages[];rectifyImages:IImages[];
}

export interface IDefectStage {
    by?:string; date?:string; remarks?:string; signature?:string;
}


export interface IImages {
    id:number; name:string; type:string; caption:string; file:string;
}


export interface IRFWIDrawingReference {
    locations:INameId;
    rfwiDrawings:IImages;
}

export interface IRFWIDrawingFile {
    date:string;
    rfwiDrawings:string;
}

export interface IRFWIDetail{
    id: number;no: string; entryDate: string; inspectionDate: string; startTime:string; endTime:string;status:string;
    requestFor:string;mobileStatus:number;  inspectionNo:number,mobileNo:string,
    project:INameId; inspector:INameId; trade:INameId; proceedRequest:boolean;otherSigned:boolean;
    request?:IRFWIStage;notification?:IRFWIStage;clearanceStructure?:IRFWIStage;clearanceMandE?:IRFWIStage;
    clearanceOthers?:IRFWIStage;completed?:ICompleted;
    item:INameId;generalChecklist:INameId[]; detailChecklist:INameId[];drawingReference:IRFWIDrawingReference[];
}

export interface IRFWIStage {
    by?:string; date?:string; name?:string; signature?:string;isSelected?:boolean;
}

export interface ICompleted extends IRFWIStage {
    remarks?:string; 
}

export interface ITimeSlotAvailable {
    no:string;
    name:string;
    start:string;
    end:string; 
}



export const downloadProjectMaster= async(callback:(projects:IProject[]|string)=>void)=>
{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user=getAPIHost()+'GetAllQCInspectionProjectsByGroupID?GroupID='+userInfo.groupId+'&UserID='+userInfo.userId;
        axios.get(user, { headers: { SessionId: userInfo.sessionID }})
        .then(response => 
        {
            if (response.status===200 && response.data)
            {
                let projectList:IProject[] = [];
                let pms:INameId[]=[];
                let sups:INameId[]=[];
                let loc:INameId[]=[];
                let struc:INameId[]=[];
                let me:INameId[]=[];
                let oth:INameId[]=[];
                let drawings:IImages[]=[];

                response.data.forEach((module:any)=>
                {
                    pms=[];
                    sups=[];
                    loc=[];
                    drawings=[];
                    module.Locations.forEach((location:any)=>
                        loc.push({id:location.UnitID,name:location.UnitName})
                    );
                    module.PMDetails.forEach((pmdetail:any)=>
                        pms.push({id:pmdetail.UserID,name:pmdetail.UserName})
                    );
                    module.SupervisorDetails.forEach((sup:any)=>
                        sups.push({id:sup.UserID,name:sup.UserName})
                    );

                    module.StructureInspectorDetails.forEach((stdet:any)=>
                        struc.push({id:stdet.UserID,name:stdet.UserName})
                    );
                    module.MEInspectorDetails.forEach((medet:any)=>
                        me.push({id:medet.UserID,name:medet.UserName})
                    );
                    module.OtherInspectorDetails.forEach((othdet:any)=>
                        oth.push({id:othdet.UserID,name:othdet.UserName})
                    );

                    module.RFWIDrawingReferenceFiles.forEach((draw:any)=>
                        drawings.push({id:draw.QCInspectionDrawingReferenceFileID,name:draw.FileName,type:'',
                                caption:draw.FileCaption,file:''})
                    );

                    projectList.push({id:module.ProjectID,name:module.Project_Name,manager:pms,supervisor:sups,
                            locations:loc,rfwiDrawings:drawings,
                            mandes:me,others:oth, structurs: struc})
                });
                user='-'+userInfo.groupId +'-'+userInfo.userId;
                storeDataToStorage('buildqas-qc-project-master'+user,JSON.stringify(projectList))
                if(callback)
                    callback(projectList)
            }
            else
            {
                if(callback)
                    callback(response.data.ErrorMessage)
            }
    
        })
        .catch(error => {
            if(callback)
            callback(error.message)
    
        });
     }
     else
        callback('User details not available, Please login again.')

}


export const downloadTimeSlot= async(inspectionDate:string, inspectorId:number, callback:(status:ITimeSlotAvailable[]|string)=>void)=>
{
    let path=getAPIHost()+'getrfwiformavailableslots?InspectorID='+inspectorId+'&InspectionDate='+inspectionDate;
    axios.get(path, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let details:ITimeSlotAvailable[] = [];

            response.data.forEach((module:any)=>
            {
                details.push({no:module.QCInspectionRFWINo, name:module.ProjectName, start:module.InspectionStartOn, end:module.InspectionEndOn})

            });
            if(details.length>0)
            {
                if(callback)
                    callback(details)
            }
            else
            {
                if(callback)
                    callback('All Free')
            }
        }
        else
        {
            if(callback)
                callback('All Free')
        }

    })
    .catch(error => {
        if(callback)
            callback('All Free')

    });

}


export const downloadDefects= async (callback:(status:string)=>void)=>
{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user=getAPIHost()+'getqcinspectiondefectformList?GroupID='+userInfo.groupId+'&UserID='+userInfo.userId;
        
        axios.get(user, { headers: { SessionId: userInfo.sessionID }})
        .then(response => 
        {
            if (response.status===200 && response.data)
            {
                let details:IDefectDetail[] = [];
                let defectimg:IImages[]=[];
                let rectifyimg:IImages[]=[];
                let detail:IDefectDetail;
                response.data.forEach((module:any)=>
                {
                    defectimg=[];
                    rectifyimg=[];
                    module.DefectFiles.forEach((img:any)=>
                    {
                        if(img.FileFor==='Defect')
                            defectimg.push({id:img.QCInspectionDefectFileID, name:img.FileName, type:img.FileFor, caption:img.FileCaption, file:img.FileBase64})
                        else 
                            rectifyimg.push({id:img.QCInspectionDefectFileID, name:img.FileName, type:img.FileFor, caption:img.FileCaption, file:img.FileBase64})

                    }
                    );
                    detail={id:module.QCInspectionDefectID,no: module.QCInspectionDefectNo,
                        defectRemarks:module.DefectRemarks, entryDate: module.CreatedOrUpdatedDate,
                        status: module.Status,mobileStatus:1,

                        defect: {id:module.DefectTypeID,name:module.DefectTypeName},
                        trade: {id:module.TradeID,name:module.TradeName},
                        subcontractor: {id:module.SubcontractorID,name:module.SubcontractorName},
                        project: {id:module.ProjectID,name:module.ProjectName},
                        manager: {id:module.ProjectManagerID,name:module.ProjectManagerName},
                        location: {id:module.UnitID,name:module.UnitName},
                        
                        defectImages:defectimg,rectifyImages:rectifyimg};

                    if(module.ReDoBy!==null)
                    {
                        detail.reDo={by:module.ReDoBy,remarks:module.ReDoRemarks}
                    }
                    if(module.ReDoDoneBy!==null)
                    {
                        detail.reDoDone={by:module.ReDoDoneBy,remarks:module.ReDoDoneRemarks}
                    }
                    if(module.ApprovedBy!==null)
                    {
                        detail.approved={by:module.ApprovedBy,remarks:module.ApprovedRemarks}
                    }
                    if(module.RectificationBy!==null)
                    {
                        detail.rectify={by:module.RectificationBy,remarks:module.RectificationRemarks}
                    }
                    if(module.ReworkBy!==null)
                    {
                        detail.rework={by:module.ReworkBy,remarks:module.ReworkRemarks}
                    }
                    if(module.CompletedBy!==null)
                    {
                        detail.complete={by:module.CompletedBy,remarks:module.CompletedRemarks,signature:module.CompletedSignature,date:module.CompletedDate}
                    }
                    details.push(detail);
                });
                user='-'+userInfo.groupId +'-'+userInfo.userId;

                storeDataToStorage('buildqas-qc-defect'+user,JSON.stringify(details))
               
                if(callback)
                    callback('Defect downloaded')
            }
            else
            {
                if(callback)
                    callback('Defect downloaded failed with error '+ response.data.ErrorMessage)
            }
    
        })
        .catch(error => {
            if(callback)
            callback('Defect downloaded failed with error '+error.message)
    
        });
     }
}

export const downloadDefectImages= async (defectId:number, callback:(defectimg:IImages[],rectifyimg:IImages[])=>void)=>
{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    let defectimg:IImages[]=[];
    let rectifyimg:IImages[]=[];

    if(userInfo.groupId && userInfo.userId)
    {
        user=getAPIHost()+'getqcinspectiondefectformfileList?QCInspectionDefectID='+defectId;
        axios.get(user, { headers: { SessionId: userInfo.sessionID }})
        .then(response => 
        {
            if (response.status===200 && response.data)
            {
                response.data.forEach((img:any)=>
                {
                    if(img.FileFor==='Defect')
                        defectimg.push({id:img.QCInspectionDefectFileID, name:img.FileName, type:img.FileFor, caption:img.FileCaption, file:img.FileBase64})
                    else 
                        rectifyimg.push({id:img.QCInspectionDefectFileID, name:img.FileName, type:img.FileFor, caption:img.FileCaption, file:img.FileBase64})

                });

                if(defectimg.length>0)
                    storeDataToStorage('buildqas-qc-defect-image-'+defectId,JSON.stringify(defectimg))
                if(rectifyimg.length>0)
                    storeDataToStorage('buildqas-qc-rectify-image-'+defectId,JSON.stringify(rectifyimg))
                
            }
            callback(defectimg,rectifyimg);
    
        })
        .catch(error => {
            console.log(error)
            getDefectImages(defectId,callback);
    
        });
     }
}

export const getDefectImages= async (defectId:number, callback:(defectimg:IImages[],rectifyimg:IImages[])=>void)=>{

    let defectimg:IImages[]=[];
    let rectifyimg:IImages[]=[];

    try {
        let value  = await AsyncStorage.getItem('buildqas-qc-defect-image-'+defectId)
        if(value!==null)
        {
            defectimg = JSON.parse(value as string)
        }
        value  = await AsyncStorage.getItem('buildqas-qc-rectify-image-'+defectId)
        if(value!==null)
        {
            rectifyimg = JSON.parse(value as string)
        }
    } catch(e) 
    {
    }

    callback(defectimg,rectifyimg);

}

export const getDefectStatusImage= (status:string):ImageSourcePropType=>{
    if (status==='New'||status==='Pending')
        return require('../images/icons/Pending.png');
    else if (status==='Approved')
        return require('../images/icons/Approval.png');    
    else if (status==='Redo')
        return require('../images/icons/Redo.png');    
    else if (status==='ReDoDone')
        return require('../images/icons/Redo-Done.png');    
    else if (status==='Rectified')
        return require('../images/icons/Rectified.png');    
    else if (status==='Rework')
        return require('../images/icons/Rework.png');    
    else if (status==='Rework Done')
        return require('../images/icons/Approval.png');    
    else 
        return require('../images/icons/Completed.png');    
}

export const getProjectMaster= async(callback:(projects:IProject[]|string)=>void)=>{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        try {
            user='-'+userInfo.groupId +'-'+userInfo.userId;
            const value  = await AsyncStorage.getItem('buildqas-qc-project-master'+user)
            if(value!==undefined)
            {
                callback(JSON.parse(value as string))
            }
            else
                callback('Details not available for Project, Please sync Project master with server.')

          } catch(e) {
            console.log(e);
            if(callback)
                callback(e.message)
          }
    }
    else
        callback('User details not available, Please login again.')
}

export const getDefects= async (callback:(details:IDefectDetail[])=>void)=>{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user='-'+userInfo.groupId +'-'+userInfo.userId;

        try {
            const value  = await AsyncStorage.getItem('buildqas-qc-defect'+user)
            let syn:IDefectDetail[]=[];
            if(value!==null)
            {
                syn = JSON.parse(value as string);
            }
            if(callback)
                callback(syn)
          } catch(e) {
            console.log(e);
            if(callback)
                callback(e.message)
          }

    }
}

export const addOrupdate=(path:string,type:string,defect:any):void=>
{
    
    axios.post(path,defect, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        
        console.log(response.status)
    })
    .catch(error => {
        console.log(error.message)
    });
    
}

export const removeDefectsOrRFWI= async(id:number,storeId:string)=>{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user='-'+userInfo.groupId +'-'+userInfo.userId;
        try {
            const value  = await AsyncStorage.getItem(storeId+user)
            let syn:number[]=[];
            
            if(value!==null)
            {
                syn = JSON.parse(value as string);
            }
            
            syn.push(id);
            
            storeDataToStorage(storeId+user,JSON.stringify(syn))

          } catch(e) {
            console.log(e);
            }
    }
    
}

export const updateDefects= async (option:string,defect:IDefectDetail,callback:(canSync:boolean)=>void)=>{

    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user='-'+userInfo.groupId +'-'+userInfo.userId;
        try {
            const value  = await AsyncStorage.getItem('buildqas-qc-defect'+user)
            let syn:IDefectDetail[]=[];
            let synnew:IDefectDetail[]=[];
            let updated=0;

            if(value!==null)
            {
                syn = JSON.parse(value as string);
            }

            if(syn.length===0)
                synnew.push(defect);
            else{
                syn.forEach((oldDefect:IDefectDetail)=>{
                    if(oldDefect.id===defect.id)
                    {
                        if(option!=='REMOVE')
                        {
                            updated=1;
                            synnew.push(defect)
                        }
                    }
                    else
                        synnew.push(oldDefect) ;   
                })
                
                if(option!=='REMOVE' && updated===0)
                    synnew.push(defect);
            }
    
            storeDataToStorage('buildqas-qc-defect'+user,JSON.stringify(synnew))
            callback(true);
          } catch(e) {
            console.log(e);
            showErrorToast(e)
            callback(false);
          }

    }
    
}

export const syncRemoveDefectsOrRFWI= async (storeId:string,callback:(status:string)=>void)=>{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user='-'+userInfo.groupId +'-'+userInfo.userId;

        try 
        {
            const value  = await AsyncStorage.getItem(storeId+user)
            let syn:number[]=[];

            if(value!==null)
            {
                let post:any[]=[];

                syn = JSON.parse(value as string);
                
                syn.forEach((id:number)=>{
                    if(storeId==='buildqas-qc-defect-delete')
                        post.push({QCInspectionDefectID:id})
                    else 
                        post.push({QCInspectionRFWIFormID:id})
                });

                if(post.length>0)
                {
                    if(storeId==='buildqas-qc-defect-delete')
                    {
                        addOrupdate(getAPIHost()+'deleteqcinspectiondefectform?UserID='+userInfo.userId,'',post);
                        callback('Defect removed, Number of defect removed are ' + post.length);
                    }
                    else
                    {
                        addOrupdate(getAPIHost()+'DeleteRFWIForm?UserID='+userInfo.userId,'',post);
                        callback('RFWI removed, Number of defect removed are ' + post.length);
                    }

                    AsyncStorage.removeItem(storeId+user);
                }
                else
                    callback('No detail available to remove');
            }
            else
                callback('No detail available to remove');

        } catch(e) {
        console.log(e);
        if(callback)
            callback(e.message)
        }
    }
    
}


export const syncDefects= async (type:string,callback:(status:string)=>void)=>{                                                                                    

    let userInfo:IAppUser = getUserInfo();
    let user='';
    let path='';
    if(userInfo.groupId && userInfo.userId)
    {
        if (type==='new')
            path=getAPIHost()+'saveqcinspectiondefectform';
        else    
            path=getAPIHost()+'updateqcinspectiondefectform';

        user='-'+userInfo.groupId +'-'+userInfo.userId;

        try {
            const value  = await AsyncStorage.getItem('buildqas-qc-defect'+user)
            
            if(value!==null)
            {
                let defects:IDefectDetail[]=[];
                let edited:IDefectDetail[]=[];
                let post:any[]=[];

                defects = JSON.parse(value as string);

                if (type==='new')
                    edited =defects.filter(mstatus=>(mstatus.status==='New'||(mstatus.status==='Approved' && mstatus.mobileStatus===0)));
                else
                    edited =defects.filter(mstatus=>mstatus.mobileStatus===2);

                edited.forEach((defect:IDefectDetail)=>{

                        let images:any[]=[];
                        defect.defectImages.forEach((img:IImages)=>{
                            images.push({
                                QCInspectionDefectFileID: (type==='new'?0:img.id),
                                FileFor: img.type,
                                FileCaption: img.caption,
                                FileName: img.name,
                                FileBase64: img.file
                            } )
                        });
                        defect.rectifyImages.forEach((img:IImages)=>{
                            images.push({
                                QCInspectionDefectFileID: (type==='new'?0:img.id),
                                FileFor: img.type,
                                FileCaption: img.caption,
                                FileName: img.name,
                                FileBase64: img.file
                            } )
                        });
                        

                        post.push({
                            QCInspectionDefectID: (type==='new'?0:defect.id),
                            QCInspectionDefectNo: (type==='new'?null:defect.no) ,
                            ProjectID: defect.project.id,
                            UnitID: defect.location.id,
                            TradeID: defect.trade.id,
                            DefectTypeID: defect.defect.id,
                            DefectRemarks: defect.defectRemarks,
                            SubcontractorID: defect.subcontractor.id,
                            ProjectManagerID: defect.manager.id,
                            ApprovedBy: defect.approved?.by,
                            ApprovedDate: defect.approved?.date,
                            ApprovedRemarks: defect.approved?.remarks,
                            ReDoBy: defect.reDo?.by,
                            ReDoDate: defect.reDo?.date,
                            ReDoRemarks: defect.reDo?.remarks,
                            ReDoDoneBy: defect.reDoDone?.by,
                            ReDoDoneDate: defect.reDoDone?.date,
                            ReDoDoneRemarks: defect.reDoDone?.remarks,
                            RectificationBy: defect.rectify?.by,
                            RectificationDate: defect.rectify?.date,
                            RectificationRemarks: defect.rectify?.remarks,
                            RectificationSignature: null,
                            ReworkBy: defect.rework?.by,
                            ReworkDate: defect.rework?.date,
                            ReworkRemarks: defect.rework?.remarks,
                            CompletedBy: defect.complete?.by,
                            CompletedDate: defect.complete?.date,
                            CompletedRemarks: defect.complete?.remarks,
                            CompletedSignature: defect.complete?.signature,
                            Status: (type==='new' && defect.status==='Approved'?'Approved':(type==='new'?  'Pending': defect.status)),
                            MobileQCInspectionDefectID: 0,
                            BatchID: null,
                            MobileStatus: (type==='new' && defect.status==='Approved'?1:(type==='new'?1: defect.mobileStatus)),
                            CreatedOrUpdatedByUserId: userInfo.userId,
                            CreatedOrUpdatedDate: defect.entryDate,
                            DefectFiles:images
                        })

                })
                if(post.length>0)
                {
                    
                    axios.post(path,post, { headers: { SessionId: userInfo.sessionID }})
                    .then(response => 
                    {
                        let newdefect:IDefectDetail[]=[];
                        for( let iCounter =0 ; iCounter< defects.length; iCounter++){
                            if(edited.filter(edit=>edit.id === defects[iCounter].id).length===0 )
                                newdefect.push(defects[iCounter])
                          } 
                        if(newdefect.length>0)
                            storeDataToStorage('buildqas-qc-defect'+user,JSON.stringify(newdefect))
                        else
                            AsyncStorage.removeItem('buildqas-qc-defect'+user)
    
                        callback('Defect uploaded, Number of defect uploaded are ' + post.length);
    
                    })
                    .catch(error => {
                        callback(error.message)
                        console.log(error.message)
                    });
                    
                    
                }
                else
                    callback('No Defect available to upload');
            }
            else
                callback('No Defect available to upload');
               
          } catch(e) {
            console.log(e);
            if(callback)
                callback(e.message)
          }
    }
    
}


export const downloadRFWI=(callback:(status:string)=>void):void=>
{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user=getAPIHost()+'getrfwiformlist?GroupID='+userInfo.groupId+'&UserID='+userInfo.userId ;       
        
        axios.get(user, { headers: { SessionId: userInfo.sessionID }})
        .then(response => 
        {
            if (response.status===200 && response.data)
            {
                let details:IRFWIDetail[] = [];
                let detail:IRFWIDetail;
                let check:INameId[]=[];
                let detailcheck:INameId[]=[];
                let items:INameId[]=[];
                let drawing:IRFWIDrawingReference[]=[];
                
                response.data.forEach((module:any)=>
                {
                    
                    if (userInfo.groupId==='8' && module.Status==='Pending')
                    {
                        
                    }
                    else
                    {
                        check=[];
                        detailcheck=[];
                        items=[];
                        drawing=[];
                        
                        module.QCInspectionRFWIFormGeneralCheckListDetailMobileViewModels.forEach((det:any)=>check.push({id:det.GeneralCheckListID,name:det.GeneralCheckListName}))
                        module.QCInspectionRFWIFormTradeDetailedCheckListDetailMobileViewModels.forEach((det:any)=>detailcheck.push({id:det.TradeDetailedCheckListID,name:det.DetailedCheckListName}))
                        module.QCInspectionRFWIFormTradeItemDetailMobileViewModels.forEach((det:any)=>items.push({id:det.TradeItemID,name:det.ItemName}))
                        module.QCInspectionRFWIFormLocationDetailMobileViewModels.forEach((det:any)=>drawing.push(
                            {locations:{id:det.UnitID,name:det.UnitName},
                            rfwiDrawings:{id:det.QCInspectionDrawingReferenceFileID,name: det.FileName,type:'',
                            caption: det.FileCaption,file:det.FileBase64} }))
    
                        detail={
                            
                            id:module.QCInspectionRFWIFormID,
                            no: module.QCInspectionRFWINo, mobileNo:module.QCInspectionRFWINo,
                            project: {id:module.ProjectID,name:module.ProjectName},
                            trade: {id:module.TradeID,name:module.TradeName},
                            request:{by:module.RequestBy,name:module.RequestByName,date:module.RequestOn,signature:module.RequestSignature},
                            notification:{name:module.NotiicationReceivedByName,date:module.NotiicationReceivedOn,signature:module.NotiicationReceivedSignature},
                            inspectionNo:module.InspectionNo,
                            inspectionDate: module.InspectionOn,
                            startTime:module.InspectionStartOn===null?'':module.InspectionStartOn, 
                            endTime:module.InspectionEndOn===null?'':module.InspectionEndOn,
                            inspector:{id:module.InspectorID,name:module.InspectorName},
                            requestFor:module.RequestFor,

                            clearanceStructure:{isSelected:module.OtherTradeClearance_Structure,by:module.OtherTradeClearance_StructureBy,name:module.OtherTradeClearance_StructureByName,date:module.OtherTradeClearance_StructureOn,signature:module.OtherTradeClearance_StructureSignature},
                            clearanceMandE:{isSelected:module.OtherTradeClearance_MandE,by:module.OtherTradeClearance_MandEBy,name:module.OtherTradeClearance_MandEByName,date:module.OtherTradeClearance_MandEOn,signature:module.OtherTradeClearance_MandESignature},
                            clearanceOthers:{isSelected:module.OtherTradeClearance_Other,by:module.OtherTradeClearance_OtherBy,name:module.OtherTradeClearance_OtherByName,date:module.OtherTradeClearance_OtherOn,signature:module.OtherTradeClearance_OtherSignature},
                            completed:{by:module.CompletedBy,name:module.CompletedByName,date:module.CompletedDate,signature:module.CompletedSignature,remarks:module.CompletedRemarks},

                            entryDate: module.CreatedOrUpdatedDate, 
                            
                            mobileStatus:module.MobileStatus,
                            status:module.Status,
                            proceedRequest:module.ProceedRequest,otherSigned:module.OtherSigned,
                            item:items[0],generalChecklist:check,detailChecklist:detailcheck,drawingReference:drawing
                        };
                        
                        
                        details.push(detail);
    
                    }

                });
                user='-'+userInfo.groupId +'-'+userInfo.userId;
                storeDataToStorage('buildqas-qc-rfwi'+user,JSON.stringify(details))
               
                if(callback)
                    callback('RFWI downloaded')
            }
            else
            {
                if(callback)
                    callback('RFWI downloaded faled with error '+ response.data.ErrorMessage)
            }
    
        })
        .catch(error => {
            console.log(error)
            if(callback)
            callback('RFWI downloaded faled with error '+error.message)
    
        });
     }

}

export const getRFWI = async (callback:(details:IRFWIDetail[])=>void)=>{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user='-'+userInfo.groupId +'-'+userInfo.userId;

        try {
            
            const value  = await AsyncStorage.getItem('buildqas-qc-rfwi'+user)
            let syn:IRFWIDetail[]=[];
            if(value!==null)
            {
                syn = JSON.parse(value as string);
            }
            if(callback)
                callback(syn)
          } catch(e) {
            console.log(e);
            if(callback)
                callback(e.message)
          }

    }
}

export const getRFWItatusImage= (status:string):ImageSourcePropType=>{
    if (status==='New'||status==='Pending')
        return require('../images/icons/Pending.png');
    else if (status==='Approved')
        return require('../images/icons/Approval.png');    
    else if (status==='Requested')
        return require('../images/icons/Requested.png');    
    else if (status==='Rejected')
        return require('../images/icons/Rejected.png');    
    else 
        return require('../images/icons/Completed.png');    
}

export const updateRFWI= async (option:string, rfwi:IRFWIDetail,callback:(canSync:boolean)=>void)=>{

    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user='-'+userInfo.groupId +'-'+userInfo.userId;
        try {
            const value  = await AsyncStorage.getItem('buildqas-qc-rfwi'+user)
            let syn:IRFWIDetail[]=[];
            let synnew:IRFWIDetail[]=[];
            let updated=0;

            if(value!==null)
            {
                syn = JSON.parse(value as string);
            }

            if(syn.length===0)
                synnew.push(rfwi);
            else{
                syn.forEach((oldrfwi:IRFWIDetail)=>{
                    if(oldrfwi.id===rfwi.id)
                    {
                        if(option!=='REMOVE')
                        {
                            updated=1;
                            synnew.push(rfwi)
                        }
                    }
                    else
                        synnew.push(oldrfwi) ;   
                })
                
                if(option!=='REMOVE' && updated===0)
                    synnew.push(rfwi);
            }
    
            storeDataToStorage('buildqas-qc-rfwi'+user,JSON.stringify(synnew))
            callback(true);
          } catch(e) {
            console.log(e);
            showErrorToast(e)
            callback(false);
          }

    }
    
}


export const syncRFWI= async (callback:(detail:string)=>void)=>{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user='-'+userInfo.groupId +'-'+userInfo.userId;

        try {
            const value  = await AsyncStorage.getItem('buildqas-qc-rfwi'+user)
            let syn:IRFWIDetail[]=[];
            
            if(value!==null)
            {
                syn = JSON.parse(value as string);
                syn = syn.filter(det=>(det.mobileStatus===2 || det.mobileStatus===-1))
                if(syn.length>0)
                {
                    let postSave:any[]=[];
                    let postUpdate:any[]=[];
                    syn.forEach(detail=>
                    {
                        if(detail.mobileStatus===-1)
                            postSave.push(translateRFWI(userInfo,detail))    
                        else 
                            postUpdate.push(translateRFWI(userInfo,detail))
                    })

                    if(postSave.length>0)
                        addOrupdate(getAPIHost()+'saverfwiform','',postSave);
                    if(postUpdate.length>0)
                        addOrupdate(getAPIHost()+'updaterfwiform','',postUpdate);
                    if(callback)
                        callback( (syn.length) + ' RFWI detail uploaded to server')
                }
                else 
                {
                    if(callback)
                    callback('No RFWI detail available to upload')
                }
            }
            else{
                if(callback)
                    callback('No RFWI detail available to upload')
            }
          } catch(e) {
            console.log(e);
            if(callback)
                callback(e.message)
          }
       
    }
    
}
export const translateRFWI=(userInfo:IAppUser,rfwi:IRFWIDetail):any=>
{
    let check:any[]=[];
    let detailcheck:any[]=[];
    let item:any[]=[];
    let drawing:any[]=[];

    
    rfwi.generalChecklist.forEach((det:any)=>check.push({GeneralCheckListID:det.id,GeneralCheckListName:det.name}))
    rfwi.detailChecklist.forEach((det:any)=>detailcheck.push({TradeDetailedCheckListID:det.id,DetailedCheckListName:det.name}))
    //rfwi.items.forEach((det:any)=>item.push({TradeItemID:det.id,ItemName:det.name}))
    item.push({TradeItemID:rfwi.item.id,ItemName:rfwi.item.name})
    rfwi.drawingReference.forEach((det:IRFWIDrawingReference)=>drawing.push({UnitID:det.locations.id,QCInspectionDrawingReferenceFileID:det.rfwiDrawings.id}))

    return {
            QCInspectionRFWIFormID: rfwi.no.length>3?rfwi.id:0 ,
            QCInspectionRFWINo: rfwi.no.length>3?rfwi.no:null,
            ProjectID: rfwi.project.id,
            TradeID: rfwi.trade.id,
            RequestBy: rfwi.request?.by===undefined?'':rfwi.request?.by,
            RequestOn: rfwi.request?.date===undefined?null:rfwi.request?.date,
            RequestSignature:rfwi.request?.signature===undefined?'':rfwi.request?.signature,
            InspectionNo: rfwi.inspectionNo,
            InspectionOn: rfwi.inspectionDate,
            InspectionStartOn: rfwi.startTime,
            InspectionEndOn: rfwi.endTime,
            InspectorID: rfwi.inspector.id,
            RequestFor: rfwi.requestFor,
            ItemOthers: null,
            DetailedCheckListOthers: null,

            OtherTradeClearance_Structure: rfwi.clearanceStructure?.isSelected===undefined?false:rfwi.clearanceStructure?.isSelected,
            OtherTradeClearance_StructureBy: rfwi.clearanceStructure?.isSelected===true?rfwi.clearanceStructure?.by===undefined?null:rfwi.clearanceStructure?.by :null,
            OtherTradeClearance_StructureByName: rfwi.clearanceStructure?.isSelected===true?rfwi.clearanceStructure?.name===undefined?null:rfwi.clearanceStructure?.name:null,
            OtherTradeClearance_StructureSignature: rfwi.clearanceStructure?.isSelected===true?rfwi.clearanceStructure?.signature===undefined?null:rfwi.clearanceStructure?.signature:null,
            OtherTradeClearance_StructureOn: rfwi.clearanceStructure?.isSelected===true?rfwi.clearanceStructure?.date===undefined?null:rfwi.clearanceStructure?.date:null,
            OtherTradeClearance_MandE: rfwi.clearanceMandE?.isSelected===undefined?false:rfwi.clearanceMandE?.isSelected,
            OtherTradeClearance_MandEBy: rfwi.clearanceMandE?.isSelected===true?rfwi.clearanceMandE?.by===undefined?null:rfwi.clearanceMandE?.by:null,
            OtherTradeClearance_MandEByName: rfwi.clearanceMandE?.isSelected===true?rfwi.clearanceMandE?.name===undefined?null:rfwi.clearanceMandE?.name:null,
            OtherTradeClearance_MandESignature: rfwi.clearanceMandE?.isSelected===true?rfwi.clearanceMandE?.signature===undefined?null:rfwi.clearanceMandE?.signature:null,
            OtherTradeClearance_MandEOn: rfwi.clearanceMandE?.isSelected===true?rfwi.clearanceMandE?.date===undefined?null:rfwi.clearanceMandE?.date:null,
            OtherTradeClearance_Other: rfwi.clearanceOthers?.isSelected===undefined?false:rfwi.clearanceOthers?.isSelected,
            OtherTradeClearance_OtherBy: rfwi.clearanceOthers?.isSelected===true?rfwi.clearanceOthers?.by===undefined?null:rfwi.clearanceOthers?.by:null,
            OtherTradeClearance_OtherByName: rfwi.clearanceOthers?.isSelected===true?rfwi.clearanceOthers?.name===undefined?null:rfwi.clearanceOthers?.name:null,
            OtherTradeClearance_OtherSignature: rfwi.clearanceOthers?.isSelected===true?rfwi.clearanceOthers?.signature===undefined?null:rfwi.clearanceOthers?.signature:null,
            OtherTradeClearance_OtherOn: rfwi.clearanceOthers?.isSelected===true?rfwi.clearanceOthers?.date===undefined?null:rfwi.clearanceOthers?.date:null,

            CompletedBy: rfwi.completed?.by===undefined?null:rfwi.completed?.by,
            CompletedDate: rfwi.completed?.date===undefined?null:rfwi.completed?.date,
            CompletedRemarks: rfwi.completed?.remarks===undefined?null:rfwi.completed?.remarks,
            CompletedSignature: rfwi.completed?.signature===undefined?null:rfwi.completed?.signature,
            ReInspectionFormID: rfwi.mobileStatus===-1?0:rfwi.id,
            Status: rfwi.status,
            MobileQCInspectionRFWIFormID: rfwi.mobileStatus===-1?0:rfwi.id,
            BatchID: '',
            MobileStatus: rfwi.mobileStatus===-1?1:rfwi.mobileStatus,
            CreatedOrUpdatedByUserId: userInfo.userId,
            CreatedOrUpdatedDate: rfwi.entryDate,
            QCInspectionRFWIFormGeneralCheckListDetailMobileViewModels:check,
            QCInspectionRFWIFormTradeDetailedCheckListDetailMobileViewModels:detailcheck,
            QCInspectionRFWIFormTradeItemDetailMobileViewModels:item,
            QCInspectionRFWIFormLocationDetailMobileViewModels:drawing,

            NotiicationReceivedByName: null,
            NotiicationReceivedSignature: null,
            NotiicationReceivedOn: null
            
            

        }
    
}


export const getProjectRFWIDrawing= async(projectId:number,drawingId:number,callback:(file:undefined|IRFWIDrawingFile)=>void)=>{
    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user='-'+projectId+'-'+drawingId;
        try {
            const value  = await AsyncStorage.getItem('buildqas-qc-rfwi-drawing'+user)
            if(value!==null)
            {
                if(callback)
                    callback(JSON.parse(value as string))
            }
            else
                callback(undefined)
          } catch(e) {
            callback(undefined)
          }

    }
    
}


export const downloadProjectRFWIDrawing= async (projectId:number,drawingId:number,callback:(file:undefined|IRFWIDrawingFile)=>void)=>
{

    let userInfo:IAppUser = getUserInfo();
    let user='';
    if(userInfo.groupId && userInfo.userId)
    {
        user=getAPIHost()+'GetAllRFWIDrawingReferenceFiles?ProjectID='+projectId+'&DrawingReferenceFileID='+drawingId;       
        
        axios.get(user, { headers: { SessionId: userInfo.sessionID }})
        .then(response => 
        {
            if (response.status===200 && response.data)
            {
                
                let drawing:IRFWIDrawingFile[]=[];
                response.data.forEach((module:any)=>
                {
                    drawing.push({date:moment().format('DD/MM/YYYY HH:mm:ss'),
                        rfwiDrawings:module.FileBase64?module.FileBase64 as string:''})
                });

                if(drawing.length>0)
                {
                    user='-'+ projectId +'-'+drawingId;
                    storeDataToStorage('buildqas-qc-rfwi-drawing'+user,JSON.stringify(drawing[0]))
                   
                    if(callback)
                        callback(drawing[0])
                }
                else
                    callback(undefined)
            }
            else
            {
                callback(undefined)
            }
    
        })
        .catch(error => {
            console.log(error)
            callback(undefined)
    
        });
     }

}


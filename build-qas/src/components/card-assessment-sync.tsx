
import React from "react";
import { Component } from "react";
import { IWall, IWindow, IJoint, ILeak, IDirection } from "../models/assessement";
import { addOrupdateAssessment, AssessmentTypes, deletionAssessment, IAssessmentKey } from "../utilities/assessment-functions";
import { downloadExternalWall, getExternalWall, IExternalWall } from "../utilities/external-wall-functions";
import { downloadExternalWork, getExternalWork, IExternalWork } from "../utilities/external-work-functions";
import { downloadFieldWindow, getFieldWindow, IFieldWindow } from "../utilities/field-window-functions";
import { downloadInternalFinishes, getInternalFinishes, IInternalFinishes } from "../utilities/internal-finishes-functions";
import { getDirectionMaster, getJointMaster, getLeakMaster, getWallMaster, getWindowMaster, removeSyncUploadDetails } from "../utilities/master-functions";
import { downloadRoofConstruction, getRoofConstruction, IRoofConstruction } from "../utilities/roof-construction-functions";
import { downloadWetArea, getWetArea, IWetArea } from "../utilities/wet-area-functions";

interface IProps {
    onUpdate:(message:string)=>void;
}


class CardAssessemtSync extends Component<IProps> {

    assessmentKey:IAssessmentKey;
    detailAdd:any[];
    walls:IWall[];
    windows:IWindow[];
    joints:IJoint[];
    leaks:ILeak[];
    directions:IDirection[];

    constructor(props:IProps)
    {
        super(props);

        this.assessmentKey={
            moduleId:0,
            moduleName:'',
            projectId:0,
            projectName:'',
            key:''
        }
        this.detailAdd=[];
        this.walls=[];
        this.windows=[];
        this.leaks=[];
        this.joints=[];
        this.directions=[];

        this.doSync = this.doSync.bind(this);
        this.onUpdateStatus = this.onUpdateStatus.bind(this)

        this.onSyncInternalFinishes = this.onSyncInternalFinishes.bind(this);
        this.onSyncExternalWall = this.onSyncExternalWall.bind(this);
        this.onSyncExternalWork = this.onSyncExternalWork.bind(this);
        this.onSyncRoofConstruction = this.onSyncRoofConstruction.bind(this);
        this.onSyncFieldWindow = this.onSyncFieldWindow.bind(this);
        this.onSyncWetArea = this.onSyncWetArea.bind(this);

        this.onWallMasterLoad = this.onWallMasterLoad.bind(this);
        this.onWindowMasterLoad = this.onWindowMasterLoad.bind(this);
        this.onJointMasterLoad = this.onJointMasterLoad.bind(this);
        this.onLeakMasterLoad = this.onLeakMasterLoad.bind(this);
        this.onDirectionMasterLoad = this.onDirectionMasterLoad.bind(this);

    }
    doSync=(key:IAssessmentKey) =>{

        this.assessmentKey=key;
        
        if (key.moduleId === AssessmentTypes.InternalFinishes)
            deletionAssessment('deleteinternalfinishes',key.key,this.onUpdateStatus);
        else if (key.moduleId === AssessmentTypes.ExternalWall)
            deletionAssessment('deleteexternalwall',key.key,this.onUpdateStatus);
        else if (key.moduleId === AssessmentTypes.ExternalWork)
            deletionAssessment('deleteexternalworks',key.key,this.onUpdateStatus);
        else if (key.moduleId === AssessmentTypes.RoofConsctruction)
            deletionAssessment('deleteroofconstruction',key.key,this.onUpdateStatus);
        else if (key.moduleId === AssessmentTypes.FieldWindow)
        { 
            getWallMaster(this.onWallMasterLoad);
        }
        else if (key.moduleId === AssessmentTypes.WetArea)
            deletionAssessment('deletewetareawatertightnesstest',key.key,this.onUpdateStatus);

    }

    
    onUpdateStatus(processStatus:string)
    {   
        console.log(processStatus)
        if(processStatus==='START-UPDATE') 
        {
            if (this.assessmentKey.moduleId === AssessmentTypes.InternalFinishes)
                getInternalFinishes(this.assessmentKey.projectId,this.onSyncInternalFinishes)
            else if (this.assessmentKey.moduleId === AssessmentTypes.ExternalWall)
                getExternalWall(this.assessmentKey.projectId,this.onSyncExternalWall)  
            else if (this.assessmentKey.moduleId === AssessmentTypes.ExternalWork)
                getExternalWork(this.assessmentKey.projectId,this.onSyncExternalWork)  
            else if (this.assessmentKey.moduleId === AssessmentTypes.RoofConsctruction)
                getRoofConstruction(this.assessmentKey.projectId,this.onSyncRoofConstruction)  
            else if (this.assessmentKey.moduleId === AssessmentTypes.FieldWindow)
                getFieldWindow(this.assessmentKey.projectId,this.onSyncFieldWindow)  
            else if (this.assessmentKey.moduleId === AssessmentTypes.WetArea)
                getWetArea(this.assessmentKey.projectId,this.onSyncWetArea)  
        }
        else if(processStatus==='START-ADD')
        {
            console.log(this.detailAdd)
            if (this.assessmentKey.moduleId === AssessmentTypes.InternalFinishes && this.detailAdd.length>0)
                addOrupdateAssessment('saveinternalfinishes','ADD',this.detailAdd, this.onUpdateStatus);    
            else if (this.assessmentKey.moduleId === AssessmentTypes.ExternalWall && this.detailAdd.length>0)
                addOrupdateAssessment('saveexternalwall','ADD',this.detailAdd, this.onUpdateStatus);        
            else if (this.assessmentKey.moduleId === AssessmentTypes.ExternalWork && this.detailAdd.length>0)
                addOrupdateAssessment('saveexternalworks','ADD',this.detailAdd, this.onUpdateStatus);    
            else if (this.assessmentKey.moduleId === AssessmentTypes.RoofConsctruction && this.detailAdd.length>0)
                addOrupdateAssessment('saveroofconstruction','ADD',this.detailAdd, this.onUpdateStatus);    
            else if (this.assessmentKey.moduleId === AssessmentTypes.FieldWindow && this.detailAdd.length>0)
                addOrupdateAssessment('savefieldwindowwatertightnesstest','ADD',this.detailAdd, this.onUpdateStatus);    
            else if (this.assessmentKey.moduleId === AssessmentTypes.WetArea && this.detailAdd.length>0)
                addOrupdateAssessment('savewetareawatertightnesstest','ADD',this.detailAdd, this.onUpdateStatus);                        
            else
            {
                this.onUpdateStatus('No detail available to add');
                this.onUpdateStatus('START-DOWNLOAD');
            }       
        }
        else if(processStatus==='START-DOWNLOAD') 
        {
            if (this.assessmentKey.moduleId === AssessmentTypes.InternalFinishes)
                downloadInternalFinishes(this.assessmentKey.projectId, this.onUpdateStatus);
            else if (this.assessmentKey.moduleId === AssessmentTypes.ExternalWall)
                downloadExternalWall(this.assessmentKey.projectId, this.onUpdateStatus);
            else if (this.assessmentKey.moduleId === AssessmentTypes.ExternalWork)
                downloadExternalWork(this.assessmentKey.projectId, this.onUpdateStatus);   
            else if (this.assessmentKey.moduleId === AssessmentTypes.RoofConsctruction)
                downloadRoofConstruction(this.assessmentKey.projectId, this.onUpdateStatus);   
            else if (this.assessmentKey.moduleId === AssessmentTypes.FieldWindow)
                downloadFieldWindow(this.assessmentKey.projectId,this.walls,this.windows,this.joints,this.leaks,this.directions, this.onUpdateStatus);   
            else if (this.assessmentKey.moduleId === AssessmentTypes.WetArea)
                downloadWetArea(this.assessmentKey.projectId, this.onUpdateStatus);     
        }
        else if(processStatus==='REMOVE-SYNC')
        {
            removeSyncUploadDetails(this.assessmentKey.projectId,'',this.assessmentKey.moduleName); 
            this.props.onUpdate('Completed')
        }
        else
        {
            this.props.onUpdate(processStatus)
        }    
    }
    
    onWallMasterLoad(wallMaster:IWall[]|string)
    {
        if(Array.isArray(wallMaster))
        {
            this.walls=wallMaster as IWall[];;
            
            getWindowMaster(this.onWindowMasterLoad);
        }
        else
            this.onUpdateStatus(wallMaster as string)
        
    }
    onWindowMasterLoad(windowMaster:IWindow[]|string)
    {
        
        if(Array.isArray(windowMaster))
        {
            this.windows=windowMaster as IWindow[];
            
            getJointMaster(this.onJointMasterLoad);

        }
        else
            this.onUpdateStatus(windowMaster as string)
    }
    onJointMasterLoad(jointMaster:IJoint[]|string)
    {
        if(Array.isArray(jointMaster))
        {
            this.joints=jointMaster as IJoint[];
            
            getLeakMaster(this.onLeakMasterLoad);
        }
        else
            this.onUpdateStatus(jointMaster as string)
        
    }
    onLeakMasterLoad(leakMaster:ILeak[]|string)
    {
        
        if(Array.isArray(leakMaster))
        {
            this.leaks=leakMaster as ILeak[];
            
            getDirectionMaster(this.onDirectionMasterLoad);
        }
        else
            this.onUpdateStatus(leakMaster as string)
    }
    onDirectionMasterLoad(directionMaster:IDirection[])
    {
        this.directions=directionMaster;

        deletionAssessment('deletefieldwindowwatertightnesstest','field-window-deleted-'+this.assessmentKey.projectId,this.onUpdateStatus);
    }

    onSyncExternalWall(wall:IExternalWall[]|string)
    {
        if(Array.isArray(wall))
        {
            let rowFullList=wall as IExternalWall[];
            let add:any=[];
            let update:any=[];

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
                                AssessmentEWDetailID: rowFullList[i].details[j].id,
                                AssessmentTypeModuleProcessID: rowFullList[i].details[j].pId,
                                Result: rowFullList[i].details[j].result,
                                RowNo: rowFullList[i].details[j].row    
                            })
                        }

                        let detail={
                            AssessmentEWID: rowFullList[i].status===1? 0:rowFullList[i].id,
                            ProjectID: this.assessmentKey.projectId,
                            AssessmentDate: rowFullList[i].date,
                            Block_Unit: rowFullList[i].block,
                            LocationID: rowFullList[i].lId,
                            LocationName: rowFullList[i].lName,
                            Drawing_Image: rowFullList[i].drawing,
                            MobileAssessmentEWID:  rowFullList[i].id,
                            BatchID: "",
                            Status: rowFullList[i].status,
                            CreatedOrUpdatedByUserId: 0,
                            AssessmentExternalWallTransDetailMobileViewModels:detailResult
                        };
                        if (rowFullList[i].status===1)
                            add.push(detail);
                        else if (rowFullList[i].status===2)
                            update.push(detail);    
                    }
                }
                this.detailAdd=add
                if (update.length>0)
                    addOrupdateAssessment('updateexternalwall','UPDATE', update,this.onUpdateStatus)
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
                downloadExternalWall(this.assessmentKey.projectId, this.onUpdateStatus);
            }
        }
        else 
            this.onUpdateStatus(wall as string)    
    }
        
    onSyncExternalWork(wall:IExternalWork[]|string)
    {
        if(Array.isArray(wall))
        {
            let rowFullList=wall as IExternalWork[];
            let add:any=[];
            let update:any=[];

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
                                AssessmentEWKDetailID: rowFullList[i].details[j].id,
                                AssessmentTypeModuleProcessID: rowFullList[i].details[j].pId,
                                Result: rowFullList[i].details[j].result,
                                RowNo: rowFullList[i].details[j].row       
                            })
                        }

                        let detail={
                            AssessmentEWKID: rowFullList[i].status===1? 0:rowFullList[i].id,
                            ProjectID: this.assessmentKey.projectId,
                            AssessmentDate: rowFullList[i].date,
                            Remarks: rowFullList[i].remark,
                            LocationID: rowFullList[i].lId,
                            LocationName: rowFullList[i].lName,
                            Drawing_Image: rowFullList[i].drawing,
                            MobileAssessmentEWID: rowFullList[i].id,
                            BatchID: "",
                            Status: rowFullList[i].status,
                            CreatedOrUpdatedByUserId: 0,
                            AssessmentExternalWorksTransDetailMobileViewModels:detailResult
                        };
                        if (rowFullList[i].status===1)
                            add.push(detail);   
                        else if (rowFullList[i].status===2)
                            update.push(detail);    
                    }
                }
                this.detailAdd=add
                if (update.length>0)
                    addOrupdateAssessment('updateexternalworks','UPDATE', update,this.onUpdateStatus)
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
                downloadExternalWork(this.assessmentKey.projectId, this.onUpdateStatus);
            }
        }
        else 
            this.onUpdateStatus(wall as string)    
    }

    onSyncRoofConstruction(wall:IRoofConstruction[]|string)
    {
        if(Array.isArray(wall))
        {
            let rowFullList=wall as IRoofConstruction[];
            let add:any=[];
            let update:any=[];

            console.log(rowFullList)

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
                                AssessmentRFCDetailID: rowFullList[i].details[j].id,
                                AssessmentTypeModuleProcessID: rowFullList[i].details[j].pId,
                                Result: rowFullList[i].details[j].result,
                                RowNo: rowFullList[i].details[j].row      
                            })
                        } 

                        let detail={
                            AssessmentRFCID: rowFullList[i].status===1? 0:rowFullList[i].id,
                            ProjectID: this.assessmentKey.projectId,
                            AssessmentDate: rowFullList[i].date,
                            Block_Unit: rowFullList[i].block,
                            LocationID: rowFullList[i].lId,
                            LocationName: rowFullList[i].lName,
                            Drawing_Image: rowFullList[i].drawing,
                            MobileAssessmentRFCID: rowFullList[i].id,
                            BatchID: "",
                            Status: rowFullList[i].status,
                            CreatedOrUpdatedByUserId: 0,
                            AssessmentRoofConstructionTransDetailMobileViewModels:detailResult
                        };
                        if (rowFullList[i].status===1)
                            add.push(detail);   
                        else if (rowFullList[i].status===2)
                            update.push(detail);    
                    }
                }

                console.log(add)
                //this.setState({detailAdd:add})
                this.detailAdd = add;

                if (update.length>0)
                    addOrupdateAssessment('updateroofconstruction','UPDATE', update,this.onUpdateStatus)
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
                downloadRoofConstruction(this.assessmentKey.projectId, this.onUpdateStatus);
            }
        }
        else 
            this.onUpdateStatus(wall as string)    
    }

    onSyncFieldWindow(wall:IFieldWindow[]|string)
    {
        if(Array.isArray(wall))
        {
            let rowFullList=wall as IFieldWindow[];
            let add:any=[];
            let update:any=[];

            if(rowFullList.length>0)
            {
                for(let i=0;i<rowFullList.length;i++)
                {
                    if (rowFullList[i].status!==0)
                    {
                        let detail={
                            AssessmentFWWTTID: rowFullList[i].status===1? 0:rowFullList[i].id,
                            ProjectID: this.assessmentKey.projectId,
                            AssessmentDate: rowFullList[i].date,
                            Block_Unit: rowFullList[i].block,
                            AssessmentWallID: rowFullList[i].wallId,
                            AssessmentWindowID: rowFullList[i].windowId,
                            AssessmentJointID: rowFullList[i].jointId,
                            AssessmentDirectionID: rowFullList[i].directionId,
                            AssessmentLeakID: rowFullList[i].leakId,
                            Result: rowFullList[i].result,
                            MobileAssessmentFWWTTID: rowFullList[i].id,
                            BatchID: "",
                            Status: rowFullList[i].status,
                            CreatedOrUpdatedByUserId: 0 ,
                            Drawing_Image: rowFullList[i].drawing                      
                         };
                        if (rowFullList[i].status===1)
                            add.push(detail);   
                        else if (rowFullList[i].status===2)
                            update.push(detail);    
                    }
                }
                this.detailAdd=add
                if (update.length>0)
                    addOrupdateAssessment('updatefieldwindowwatertightnesstest','UPDATE', update,this.onUpdateStatus)
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
                downloadFieldWindow(this.assessmentKey.projectId,this.walls,this.windows,this.joints,this.leaks,this.directions, this.onUpdateStatus);   
            }
        }
        else 
            this.onUpdateStatus(wall as string)    
    }

    onSyncWetArea(wall:IWetArea[]|string)
    {
        if(Array.isArray(wall))
        {
            let rowFullList=wall as IWetArea[];
            let add:any=[];
            let update:any=[];

            if(rowFullList.length>0)
            {
                for(let i=0;i<rowFullList.length;i++)
                {
                    if (rowFullList[i].status!==0)
                    {
                        let detailResult:any=[]
                        let detailOtherResult:any=[]
                        for (let j=0;j<rowFullList[i].details.length;j++)
                        {
                            if(j<=8)
                                detailResult.push({
                                    AssessmentWAWTTDetailID: rowFullList[i].details[j].id,
                                    AssessmentTypeModuleProcessID: rowFullList[i].details[j].pId,
                                    Result: rowFullList[i].details[j].result,
                                    RowNo: rowFullList[i].details[j].row    
                                })
                            else
                                detailOtherResult.push({
                                    AssessmentWAWTTDetailResultID: rowFullList[i].details[j].id,
                                    AssessmentTypeModuleProcessID: rowFullList[i].details[j].pId,
                                    Result: rowFullList[i].details[j].result,
                                    AssessmentWAWTTResultID: rowFullList[i].details[j].row    
                                })

                        }

                        let detail={
                            AssessmentWAWTTID: rowFullList[i].status===1? 0:rowFullList[i].id,
                            ProjectID: this.assessmentKey.projectId,
                            AssessmentDate: rowFullList[i].date,
                            Block_Unit: rowFullList[i].block,
                            Other_Result: rowFullList[i].others,
                            Drawing_Image: rowFullList[i].drawing,
                            MobileAssessmentWAWTTID: rowFullList[i].id,
                            BatchID: "",
                            Status: rowFullList[i].status,
                            CreatedOrUpdatedByUserId: 0,
                            AssessmentWetAreaWaterTightnessTestTransDetailMobileViewModels:detailResult,
                            AssessmentWetAreaWaterTightnessTestTransDetailResultMobileViewModels:detailOtherResult
                        };
                        if (rowFullList[i].status===1)
                            add.push(detail);   
                        else if (rowFullList[i].status===2)
                            update.push(detail);    
                    }
                }
                this.detailAdd=add
                if (update.length>0)
                    addOrupdateAssessment('updatewetareawatertightnesstest','UPDATE', update,this.onUpdateStatus)
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
                downloadWetArea(this.assessmentKey.projectId, this.onUpdateStatus);
            }
        }
        else 
            this.onUpdateStatus(wall as string)    
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
                            ProjectID: this.assessmentKey.projectId,
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
                this.detailAdd=internalFinishesAdd
                
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
                downloadInternalFinishes(this.assessmentKey.projectId, this.onUpdateStatus);
            }
                
        }
        else 
            this.onUpdateStatus(internal as string)
    }

    render(){
        return(
            <div>.</div>
        ) 
    }
}

export default CardAssessemtSync;
import React, { Component } from 'react';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import Button from '@material-ui/core/Button';
import {DialogTransition} from './dialog-title'

import { DialogTitle, Typography } from '@material-ui/core';

import { addOrupdateAssessment, deletionAssessment } from '../../utilities/assessment-functions';

import { checkOnline, getDirectionMaster, getJointMaster, getLeakMaster, getWallMaster, getWindowMaster, removeSyncUploadDetails } from '../../utilities/master-functions';
import { IWall, IWindow, IJoint, ILeak, IDirection } from '../../models/assessement';
import { getExternalWork, downloadExternalWork, IExternalWork } from '../../utilities/external-work-functions';
import { getFieldWindow, downloadFieldWindow, IFieldWindow } from '../../utilities/field-window-functions';
import { getInternalFinishes, downloadInternalFinishes, IInternalFinishes } from '../../utilities/internal-finishes-functions';
import { downloadProjectSummary } from '../../utilities/project-functions';
import { getRoofConstruction, downloadRoofConstruction, IRoofConstruction } from '../../utilities/roof-construction-functions';
import { getWetArea, downloadWetArea, IWetArea } from '../../utilities/wet-area-functions';
import { LinearProgress } from '@material-ui/core';
import { downloadExternalWall, getExternalWall, IExternalWall } from '../../utilities/external-wall-functions';

interface IProps {
    projectId:number;
    module:string;
    onSync:(status: boolean,message:string)=>void;
}

interface IState {
    addDialogOpen:boolean;
    hasError:boolean;
    
    remarks:string;
}

class DialogSync extends Component<IProps,IState> {
    
    title:string;
    path: string;
    walls:IWall[];
    windows:IWindow[];
    joints:IJoint[];
    leaks:ILeak[];
    directions:IDirection[];
    detailAdd:any[];

    constructor(props:IProps) 
    {
        super(props);
        this.title = '';
        this.path='';
        this.walls=[];
        this.windows=[];
        this.leaks=[];
        this.joints=[];
        this.directions=[];
        this.detailAdd=[];

        this.state = {addDialogOpen:false,hasError:false,remarks:''}
        this.onDialogOpen = this.onDialogOpen.bind(this);
        this.onUpdateStatus = this.onUpdateStatus.bind(this);
        
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
        this.isOnline = this.isOnline.bind(this)
    }

    onDialogOpen = () => {
        
        this.setState({addDialogOpen:true});
        checkOnline(this.isOnline)
    }
    
    isOnline(status:boolean)
    {
        if (!status)
        {
            this.setState({remarks:'No Internet connection. Continue with offline mode..',hasError:true})
            return;
        }
            
        this.onUpdateStatus('Process started');
        if (this.props.module==='Internal Finishes')
            deletionAssessment('deleteinternalfinishes','internal-finishes-deleted-'+this.props.projectId,this.onUpdateStatus);
        else if (this.props.module==='External Wall')
            deletionAssessment('deleteexternalwall','external-wall-deleted-'+this.props.projectId,this.onUpdateStatus);
        else if (this.props.module==='External Work')
            deletionAssessment('deleteexternalworks','external-work-deleted-'+this.props.projectId,this.onUpdateStatus);
        else if (this.props.module==='Roof Construction')
            deletionAssessment('deleteroofconstruction','roof-construction-deleted-'+this.props.projectId,this.onUpdateStatus);
        else if (this.props.module==='Field Window')
        { 
            getWallMaster(this.onWallMasterLoad);
            
        }
        else if (this.props.module==='Wet Area')
            deletionAssessment('deletewetareawatertightnesstest','wet-area-deleted-'+this.props.projectId,this.onUpdateStatus);
        else if (this.props.module==='Project Summary')
            this.onUpdateStatus('START-DOWNLOAD');
            
    }

    onDialogClose = () => {
        
        this.setState({addDialogOpen:false});
    }

    onSyncCompleted=()=>
    {
        this.onDialogClose();
        this.props.onSync(false,this.state.remarks);
    }

    onUpdateStatus(processStatus:string)
    {   
        if(processStatus==='START-UPDATE')
        {
            if (this.props.module==='Internal Finishes')
                getInternalFinishes(this.props.projectId,this.onSyncInternalFinishes)
            else if (this.props.module==='External Wall')
                getExternalWall(this.props.projectId,this.onSyncExternalWall)  
            else if (this.props.module==='External Work')
                getExternalWork(this.props.projectId,this.onSyncExternalWork)  
            else if (this.props.module==='Roof Construction')
                getRoofConstruction(this.props.projectId,this.onSyncRoofConstruction)  
            else if (this.props.module==='Field Window')
                getFieldWindow(this.props.projectId,this.onSyncFieldWindow)  
            else if (this.props.module==='Wet Area')
                getWetArea(this.props.projectId,this.onSyncWetArea)  
        }
        else if(processStatus==='START-ADD')
        {
            if (this.props.module==='Internal Finishes' && this.detailAdd.length>0)
                addOrupdateAssessment('saveinternalfinishes','ADD',this.detailAdd, this.onUpdateStatus);        
            else if (this.props.module==='External Wall' && this.detailAdd.length>0)
                addOrupdateAssessment('saveexternalwall','ADD',this.detailAdd, this.onUpdateStatus);        
            else if (this.props.module==='External Work' && this.detailAdd.length>0)
                addOrupdateAssessment('saveexternalworks','ADD',this.detailAdd, this.onUpdateStatus);    
            else if (this.props.module==='Roof Construction' && this.detailAdd.length>0)
                addOrupdateAssessment('saveroofconstruction','ADD',this.detailAdd, this.onUpdateStatus);    
            else if (this.props.module==='Field Window' && this.detailAdd.length>0)
                addOrupdateAssessment('savefieldwindowwatertightnesstest','ADD',this.detailAdd, this.onUpdateStatus);    
            else if (this.props.module==='Wet Area' && this.detailAdd.length>0)
                addOrupdateAssessment('savewetareawatertightnesstest','ADD',this.detailAdd, this.onUpdateStatus);    
            else
            {
                this.onUpdateStatus('No detail available to add');
                this.onUpdateStatus('START-DOWNLOAD');
            }       
        }
        else if(processStatus==='START-DOWNLOAD') 
        {
            if (this.props.module==='Internal Finishes')
                downloadInternalFinishes(this.props.projectId, this.onUpdateStatus);
            else if (this.props.module==='External Wall')
                downloadExternalWall(this.props.projectId, this.onUpdateStatus);
            else if (this.props.module==='External Work')
                downloadExternalWork(this.props.projectId, this.onUpdateStatus);   
            else if (this.props.module==='Roof Construction')
                downloadRoofConstruction(this.props.projectId, this.onUpdateStatus);   
            else if (this.props.module==='Field Window')
                downloadFieldWindow(this.props.projectId,this.walls,this.windows,this.joints,this.leaks,this.directions, this.onUpdateStatus);   
            else if (this.props.module==='Wet Area')
                downloadWetArea(this.props.projectId, this.onUpdateStatus);     
            else if (this.props.module==='Project Summary')
                downloadProjectSummary(this.props.projectId, this.onUpdateStatus);                          
        }
        else if(processStatus==='REMOVE-SYNC')
        {
            removeSyncUploadDetails(this.props.projectId,'',this.props.module); 
            this.onSyncCompleted();
        }
        else if(processStatus.startsWith('Unauthorized'))
        {
            this.setState({remarks:processStatus,hasError:true})
        }
        else
        {
            this.setState({remarks:processStatus,hasError:processStatus.startsWith('Error')?true:false})
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

        deletionAssessment('deletefieldwindowwatertightnesstest','field-window-deleted-'+this.props.projectId,this.onUpdateStatus);
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
                            ProjectID: this.props.projectId,
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
                downloadInternalFinishes(this.props.projectId, this.onUpdateStatus);
            }
                
        }
        else 
            this.onUpdateStatus(internal as string)
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
                            ProjectID: this.props.projectId,
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
                downloadExternalWall(this.props.projectId, this.onUpdateStatus);
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
                            ProjectID: this.props.projectId,
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
                downloadExternalWork(this.props.projectId, this.onUpdateStatus);
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
                            ProjectID: this.props.projectId,
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
                this.detailAdd=add
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
                downloadRoofConstruction(this.props.projectId, this.onUpdateStatus);
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
                            ProjectID: this.props.projectId,
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
                downloadFieldWindow(this.props.projectId,this.walls,this.windows,this.joints,this.leaks,this.directions, this.onUpdateStatus);   
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
                            ProjectID: this.props.projectId,
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
                downloadWetArea(this.props.projectId, this.onUpdateStatus);
            }
        }
        else 
            this.onUpdateStatus(wall as string)    
    }
    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onSyncCompleted} disableBackdropClick
            TransitionComponent={DialogTransition}  aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" >Updating {this.props.module}</DialogTitle>
                <DialogContent>
                    <LinearProgress style={{width:'500px'}}/>
                    <Typography variant="h6" style={{marginBottom:'20px',marginTop:'20px'}}>{this.state.remarks}</Typography>
                </DialogContent>
                {this.state.hasError && <DialogActions>
                <Button onClick={this.onSyncCompleted} style={{color:'white',backgroundColor:'#2c61a7'} } 
                    variant="contained">Okay </Button>
                
                </DialogActions>}
            </Dialog>
                   
        )
    }
}

export default DialogSync;
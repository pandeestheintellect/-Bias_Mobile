import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IDirection, IJoint, ILeak, IWall, IWindow } from '../models/assessement';
import { addOrupdateAssessment, deletionAssessment } from '../utilities/assessment-functions';
import { downloadExternalWall, getExternalWall, IExternalWall } from '../utilities/external-wall-functions';
import { downloadExternalWork, getExternalWork, IExternalWork } from '../utilities/external-work-functions';
import { downloadFieldWindow, getFieldWindow, IFieldWindow } from '../utilities/field-window-functions';
import { downloadInternalFinishes, getInternalFinishes, IInternalFinishes } from '../utilities/internal-finishes-functions';
import { checkOnline, getDirectionMaster, getJointMaster, getLeakMaster, getWallMaster, getWindowMaster, removeSyncUploadDetails } from '../utilities/master-functions';
import { downloadProjectSummary } from '../utilities/project-functions';
import { downloadRoofConstruction, getRoofConstruction, IRoofConstruction } from '../utilities/roof-construction-functions';
import { downloadWetArea, getWetArea, IWetArea } from '../utilities/wet-area-functions';

type TParams = { projectId: string,module: string };
interface IState {
    status:string[];
    detailAdd:any[];
    allDone:boolean;
}
class AssessmentSync extends Component<RouteComponentProps<TParams>,IState > {
 
    projectId:number;  
    module:string;
    title:string;
    path: string;
    walls:IWall[];
    windows:IWindow[];
    joints:IJoint[];
    leaks:ILeak[];
    directions:IDirection[];
    constructor(props:RouteComponentProps<TParams> )
    {
        super(props)
        this.projectId = parseInt(this.props.match.params.projectId) ;
        this.module = this.props.match.params.module ;
        this.title = '';
        this.path='';
        this.walls=[];
        this.windows=[];
        this.leaks=[];
        this.joints=[];
        this.directions=[];
        if (this.module==='internal-finishes')
        {
            this.title = 'Internal Finishes';
            this.path = '/assessment-internal-finishes/'+this.projectId;
        }
        else if (this.module==='external-wall')
        {
            this.title = 'External Wall';
            this.path = '/assessment-external-wall/'+this.projectId;
        }
        else if (this.module==='external-work')
        {
            this.title = 'External Work';
            this.path = '/assessment-external-work/'+this.projectId;
        }
        else if (this.module==='roof-construction')
        {
            this.title = 'Roof Construction';
            this.path = '/assessment-roof-construction/'+this.projectId;
        }
        else if (this.module==='field-window')
        {
            this.title = 'Field Window';
            this.path = '/assessment-field-window/'+this.projectId;
        }
        else if (this.module==='wet-area')
        {
            this.title = 'Wet Area';
            this.path = '/assessment-wet-area/'+this.projectId;
        }
        else if (this.module==='project-summary')
        {
            this.title = 'Project Summary';
            this.path = '/assessment-summary/'+this.projectId;
        }
        this.state = {
            status:[],
            detailAdd:[],
            allDone:false
        }
        this.onUpdateStatus = this.onUpdateStatus.bind(this);
        
        this.onSyncInternalFinishes = this.onSyncInternalFinishes.bind(this);
        this.onSyncExternalWall = this.onSyncExternalWall.bind(this);
        this.onSyncExternalWork = this.onSyncExternalWork.bind(this);
        this.onSyncRoofConstruction = this.onSyncRoofConstruction.bind(this);
        this.onSyncFieldWindow = this.onSyncFieldWindow.bind(this);
        this.onSyncWetArea = this.onSyncWetArea.bind(this);
        this.onHeaderClick = this.onHeaderClick.bind(this);

        this.onWallMasterLoad = this.onWallMasterLoad.bind(this);
        this.onWindowMasterLoad = this.onWindowMasterLoad.bind(this);
        this.onJointMasterLoad = this.onJointMasterLoad.bind(this);
        this.onLeakMasterLoad = this.onLeakMasterLoad.bind(this);
        this.onDirectionMasterLoad = this.onDirectionMasterLoad.bind(this);
        this.isOnline = this.isOnline.bind(this)
    }
    componentDidMount()
    {
        checkOnline(this.isOnline)
    }
    
    isOnline(status:boolean)
    {
        if (!status)
        {
            this.onUpdateStatus('No Internet connection. Continue with offline mode..');
            this.setState({allDone:true});
            return;
        }

        this.onUpdateStatus('Process started');
        if (this.module==='internal-finishes')
            deletionAssessment('deleteinternalfinishes','internal-finishes-deleted'+this.projectId,this.onUpdateStatus);
        else if (this.module==='external-wall')
            deletionAssessment('deleteexternalwall','external-wall-deleted'+this.projectId,this.onUpdateStatus);
        else if (this.module==='external-work')
            deletionAssessment('deleteexternalworks','external-work-deleted'+this.projectId,this.onUpdateStatus);
        else if (this.module==='roof-construction')
            deletionAssessment('deleteroofconstruction','roof-construction-deleted'+this.projectId,this.onUpdateStatus);
        else if (this.module==='field-window')
        { 
            getWallMaster(this.onWallMasterLoad);
            
        }
        else if (this.module==='wet-area')
            deletionAssessment('deletewetareawatertightnesstest','wet-area-deleted'+this.projectId,this.onUpdateStatus);
        else if (this.module==='project-summary')
            this.onUpdateStatus('START-DOWNLOAD');
    }
    onUpdateStatus(processStatus:string)
    {   
        if(processStatus==='START-UPDATE')
        {
            if (this.module==='internal-finishes')
                getInternalFinishes(this.projectId,this.onSyncInternalFinishes)
            else if (this.module==='external-wall')
                getExternalWall(this.projectId,this.onSyncExternalWall)  
            else if (this.module==='external-work')
                getExternalWork(this.projectId,this.onSyncExternalWork)  
            else if (this.module==='roof-construction')
                getRoofConstruction(this.projectId,this.onSyncRoofConstruction)  
            else if (this.module==='field-window')
                getFieldWindow(this.projectId,this.onSyncFieldWindow)  
            else if (this.module==='wet-area')
                getWetArea(this.projectId,this.onSyncWetArea)  
        }
        else if(processStatus==='START-ADD')
        {
            if (this.module==='internal-finishes' && this.state.detailAdd.length>0)
                addOrupdateAssessment('saveinternalfinishes','ADD',this.state.detailAdd, this.onUpdateStatus);        
            else if (this.module==='external-wall' && this.state.detailAdd.length>0)
                addOrupdateAssessment('saveexternalwall','ADD',this.state.detailAdd, this.onUpdateStatus);        
            else if (this.module==='external-work' && this.state.detailAdd.length>0)
                addOrupdateAssessment('saveexternalworks','ADD',this.state.detailAdd, this.onUpdateStatus);    
            else if (this.module==='roof-construction' && this.state.detailAdd.length>0)
                addOrupdateAssessment('saveroofconstruction','ADD',this.state.detailAdd, this.onUpdateStatus);    
            else if (this.module==='field-window' && this.state.detailAdd.length>0)
                addOrupdateAssessment('savefieldwindowwatertightnesstest','ADD',this.state.detailAdd, this.onUpdateStatus);    
            else if (this.module==='wet-area' && this.state.detailAdd.length>0)
                addOrupdateAssessment('savewetareawatertightnesstest','ADD',this.state.detailAdd, this.onUpdateStatus);    
            else
            {
                this.onUpdateStatus('No detail available to add');
                this.onUpdateStatus('START-DOWNLOAD');
            }       
        }
        else if(processStatus==='START-DOWNLOAD') 
        {
            if (this.module==='internal-finishes')
                downloadInternalFinishes(this.projectId, this.onUpdateStatus);
            else if (this.module==='external-wall')
                downloadExternalWall(this.projectId, this.onUpdateStatus);
            else if (this.module==='external-work')
                downloadExternalWork(this.projectId, this.onUpdateStatus);   
            else if (this.module==='roof-construction')
                downloadRoofConstruction(this.projectId, this.onUpdateStatus);   
            else if (this.module==='field-window')
                downloadFieldWindow(this.projectId,this.walls,this.windows,this.joints,this.leaks,this.directions, this.onUpdateStatus);   
            else if (this.module==='wet-area')
                downloadWetArea(this.projectId, this.onUpdateStatus);     
            else if (this.module==='project-summary')
                downloadProjectSummary(this.projectId, this.onUpdateStatus);                          
        }
        else if(processStatus==='REMOVE-SYNC')
        {
            removeSyncUploadDetails(this.projectId,'',this.title); 
            this.setState({allDone:true});
        }
        else
        {
            let currentStatus = this.state.status;
            currentStatus.push(processStatus);
            this.setState({status:currentStatus})
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

        deletionAssessment('deletefieldwindowwatertightnesstest','field-window-deleted'+this.projectId,this.onUpdateStatus);
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
                            ProjectID: this.projectId,
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
                this.setState({detailAdd:internalFinishesAdd})
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
                downloadInternalFinishes(this.projectId, this.onUpdateStatus);
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
                            ProjectID: this.projectId,
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
                this.setState({detailAdd:add})
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
                downloadExternalWall(this.projectId, this.onUpdateStatus);
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
                            ProjectID: this.projectId,
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
                this.setState({detailAdd:add})
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
                downloadExternalWork(this.projectId, this.onUpdateStatus);
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
                            ProjectID: this.projectId,
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
                this.setState({detailAdd:add})
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
                downloadRoofConstruction(this.projectId, this.onUpdateStatus);
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
                            ProjectID: this.projectId,
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
                            CreatedOrUpdatedByUserId: 0,
                            Drawing_Image: rowFullList[i].drawing                                              
                        };
                        if (rowFullList[i].status===1)
                            add.push(detail);   
                        else if (rowFullList[i].status===2)
                            update.push(detail);    
                    }
                }
                this.setState({detailAdd:add})
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
                downloadFieldWindow(this.projectId,this.walls,this.windows,this.joints,this.leaks,this.directions, this.onUpdateStatus);   
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
                            ProjectID: this.projectId,
                            AssessmentDate: rowFullList[i].date,
                            Block_Unit: rowFullList[i].block,
                            Other_Result: rowFullList[i].others,
                            Drawing_Image: rowFullList[i].drawing ,                     
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
                this.setState({detailAdd:add})
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
                downloadWetArea(this.projectId, this.onUpdateStatus);
            }
        }
        else 
            this.onUpdateStatus(wall as string)    
    }

    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='JUMP')
            this.props.history.push(this.path);    
      
    }
    
    render() {
        return (
            <div className={'page'}>
                <div style={{fontSize:'18px'}}>
                    <Toolbar style={{marginTop:'4px', paddingRight:'0px',backgroundColor: '#F16876',color: '#FFF'}} >
                        <Tooltip title="navigate to previous window"  arrow>
                            <IconButton style={{marginRight:'10px'}} color="inherit" aria-label="out" size='small' onClick={(e:React.MouseEvent<HTMLElement>) => this.onHeaderClick('BACK','')}>
                                <FontAwesomeIcon icon="angle-left" style={{fontSize:'30px'}}/>
                            </IconButton>
                        </Tooltip>
                        <Typography variant="h6">Sync {this.title}</Typography>
                        <Typography variant="h6" style={{flexGrow: 1,textAlign:'center'}}></Typography>
                        <div style={{width:'calc(100% - 970px)'}}></div>
                    </Toolbar>
                </div>
                <List component="nav" aria-label="main mailbox folders">
                    {
                        this.state.status.map((status:string, index:number)=>
                        <ListItem key={index} button>
                            <ListItemIcon>
                                <FontAwesomeIcon icon="check"  style={{fontSize:'20px',marginLeft:'10px'}}/>
                            </ListItemIcon>
                            <ListItemText primary={status} />
                        </ListItem>
                        )
                    }
                </List>
                {this.state.allDone && <Button onClick={(e:React.MouseEvent<HTMLElement>) => this.onHeaderClick('JUMP','')} color="primary" 
                    variant="contained">Go to {this.title} </Button>
                }
            </div>
        );
    }
}
export default withRouter(AssessmentSync);
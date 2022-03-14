
import React from "react"; 
import { Component } from "react";
import {Prompt,RouteComponentProps, withRouter } from "react-router-dom";
import  HeaderPage  from "../components/header-page";
import { AutoSizer, List} from 'react-virtualized'
import {IProject } from "../models/project";
import { AssessmentTypes, markForDeletion, markForUpdate } from "../utilities/assessment-functions";

import Button from "@material-ui/core/Button";

import { getProjectHeader, updateAssessmentWeightage } from "../utilities/project-functions";
import { getDirectionMaster, getJointMaster, getLeakMaster, getModuleProcessMaster, getWallMaster, getWindowMaster, removeSyncUploadDetails } from "../utilities/master-functions";
import {  IAssessmentModuleProcess, IDirection, IJoint, ILeak, IModuleProcess, IWall, IWindow } from "../models/assessement";
import { downloadFieldWindow, getFieldWindow, IFieldWindow } from "../utilities/field-window-functions";
import AssessmentButton from "../components/assessment-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import DialogAddFieldWindow from "../components/dialogs/dialog-add-field-window";
import { ProviderContext, withSnackbar } from "notistack";
import DialogDeleteConfirm from "../components/dialogs/dialog-delete-confirm";
import LeakThrough from "../components/leak-through";
import DialogSync from "../components/dialogs/dialog-sync";
import DialogDrawing from "../components/dialogs/dialog-drawing";
import { getUserInfo } from "../utilities/user-functions";



type TParams = { projectId: string };

type RowRendererParams = {
    index: number,
    isScrolling: boolean,
    isVisible: boolean,
    key: string,
    parent: Object,
    style: Object,
};


interface IState {
    projectInfo:IProject|null;
    process:IModuleProcess|undefined;
    
    rowCount:number;
    noOfCompliance:number;
    noOfCheck:number;

    scrollToIndex:number;
    isEdited:boolean;
    navigationPath:string;

    winWidth:number;
    winHeight:number;
    canEdit:boolean;
    headerName:string;
}

class AssessmentFieldWindow extends Component<RouteComponentProps<TParams> & ProviderContext,IState> {

    projectId:number;
    compliance:number =0;
    checks:number =0;
    header = React.createRef<HeaderPage>();
    signatureDialog = React.createRef<DialogDrawing>();
    addDialog = React.createRef<DialogAddFieldWindow>();
    deleteDialog = React.createRef<DialogDeleteConfirm>();
    syncDialog = React.createRef<DialogSync>();
    
    list = React.createRef<List>();
    rowFullList:IFieldWindow[];
    rowList:IFieldWindow[];
    walls:IWall[];
    windows:IWindow[];
    joints:IJoint[];
    leaks:ILeak[];
    directions:IDirection[];

    constructor(props:RouteComponentProps<TParams> & ProviderContext) {
        super(props);

        this.projectId = parseInt(this.props.match.params.projectId) ;

        this.onProjectHeaderLoad = this.onProjectHeaderLoad.bind(this);
        this.onModuleProcessMasterDownloaded = this.onModuleProcessMasterDownloaded.bind(this)
        this.onFieldWindowDownloaded = this.onFieldWindowDownloaded.bind(this);
        this.getFullListIndex = this.getFullListIndex.bind(this);
        this.canAdd = this.canAdd.bind(this);
        this.onSign = this.onSign.bind(this);
        this.onCreate=this.onCreate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onProcessChange = this.onProcessChange.bind(this);
        this.onSync = this.onSync.bind(this)
        this.onUpdateStatus = this.onUpdateStatus.bind(this);
        this.renderRow = this.renderRow.bind(this);

        this.onWallMasterLoad = this.onWallMasterLoad.bind(this);
        this.onWindowMasterLoad = this.onWindowMasterLoad.bind(this);
        this.onJointMasterLoad = this.onJointMasterLoad.bind(this);
        this.onLeakMasterLoad = this.onLeakMasterLoad.bind(this);
        this.onDirectionMasterLoad = this.onDirectionMasterLoad.bind(this);
        this.onLeakThru = this.onLeakThru.bind(this);
        this.getLeakThruRow = this.getLeakThruRow.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this.rowFullList=[];
        this.rowList=[];
        this.walls=[];
        this.windows=[];
        this.leaks=[];
        this.joints=[];
        this.directions=[];
        this.state = {
            projectInfo:null,
            process:undefined,
            noOfCompliance:0,
            noOfCheck:0,
            rowCount:0,
            scrollToIndex:0,
            isEdited:false,
            navigationPath:'',
            winWidth:0,
            winHeight:0,
            canEdit:true,
            headerName:'Field Window Water Tightness Test (WTT)'

          }
         
    }
    componentDidMount()
    {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
        window.addEventListener("orientationchange", this.updateWindowDimensions, false);
        
        if (getUserInfo().isOffline===true)
            getProjectHeader(this.projectId,this.onProjectHeaderLoad);  
        else
            this.syncDialog.current?.onDialogOpen();

    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
        window.removeEventListener("orientationchange", this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this.setState({ winWidth: window.screen.availWidth, winHeight: window.screen.availHeight });
    };


    onProjectHeaderLoad(headerInfo:IProject)
    {
        let edit :boolean = (headerInfo.assessorType==='Co-Assessor'|| headerInfo.status==='Completed')?false:true;
        let name =  headerInfo.name===undefined?'Field Window Water Tightness Test (WTT)':'Field Window Water Tightness Test (WTT) - '+headerInfo.name;

        if(edit===false)
        {
            name = name + ' (View only)';
            this.header.current?.onBlockEdit();
        }

        this.setState({projectInfo:headerInfo,canEdit:edit,headerName:name})

        getModuleProcessMaster(this.onModuleProcessMasterDownloaded); 
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

        getFieldWindow(this.projectId,this.onFieldWindowDownloaded)
    }
    onModuleProcessMasterDownloaded(moduls:IAssessmentModuleProcess[]|string)
    {
        if(Array.isArray(moduls))
        {
            let mst:IModuleProcess|undefined;
            let process = moduls as IAssessmentModuleProcess[];
            for (let i=0;i<process.length;i++) 
            {
                if (process[i].assessmentId===AssessmentTypes.FieldWindow)
                {
                    if(mst!==undefined)
                    {
                        mst?.process.push({id:process[i].id,name:process[i].name});                        
                    }
                    else
                        mst = {id:process[i].moduleId,name:process[i].moduleName,
                            process:[{id:process[i].id,name:process[i].name}]};
                }
            }
            
            this.setState({process:mst})

            getWallMaster(this.onWallMasterLoad);
        }
        else
            this.onUpdateStatus(moduls as string)
    }

    onFieldWindowDownloaded(FieldWindow:IFieldWindow[]|string)
    {
        if(Array.isArray(FieldWindow))
        {
            this.rowFullList=JSON.parse(JSON.stringify(FieldWindow));
            this.rowList=JSON.parse(JSON.stringify(this.rowFullList));

            if(this.rowFullList.length>0)
            {
                
                for(let i=0;i<this.rowFullList.length;i++)
                {
                    if(this.rowFullList[i].result!==0)
                    {
                        switch (this.rowFullList[i].result)
                        {
                            case 1:
                                this.compliance++;
                                this.checks++;
                                break;
                            case 2:
                                this.checks++;
                                break;
                        }
                    }
                }
            }

            this.setState({rowCount:this.rowList.length,noOfCompliance:this.compliance,noOfCheck:this.checks});

            this.onUpdateSummary(this.compliance,this.checks);
        }
        else
            this.onUpdateStatus(FieldWindow as string);
        
        removeSyncUploadDetails(this.projectId,this.state.projectInfo?.name as string,'Field Window'); 
        
    }
    onSearch(keyword:string){
        this.setState({rowCount:0})
        if(keyword==='')
            this.rowList=JSON.parse(JSON.stringify(this.rowFullList))
        else
        {
            keyword =keyword.toLowerCase();
            let lst = this.rowFullList.filter((item:IFieldWindow)=>{
                if ((item.id+'').indexOf(keyword)>=0 || item.block.toLowerCase().indexOf(keyword)>=0)
                    return true;
                else
                    return false;
                })
            this.rowList=JSON.parse(JSON.stringify(lst))    
        }
        this.setState({rowCount:this.rowList.length})
    }
    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='NAVIGATE')
            this.props.history.push(path);    
        else if (action==='SYNC')    
        this.props.history.push('/assessment-sync/field-window/'+this.projectId);
        else if (action==='ADD') 
        {
            if(!this.state.process?.process)
                this.onUpdateStatus('Details not available for Process, Please sync Process master with server.') 
            else if (this.walls.length===0)
            {
                this.onUpdateStatus('Details not available for Wall, Please sync Wall master with server.')
            }
            else if (this.windows.length===0)
            {
                this.onUpdateStatus('Details not available for windows, Please sync windows master with server.')
            }
            else if (this.joints.length===0)
            {
                this.onUpdateStatus('Details not available for joints, Please sync joints master with server.')
            }
            else if (this.leaks.length===0)
            {
                this.onUpdateStatus('Details not available for Leak, Please sync Leak master with server.')
            }
            else
                this.addDialog.current?.onDialogOpen(this.walls,this.windows,this.joints,this.leaks,this.directions);    
        } 
            
    }
   
    onUpdateStatus(status:string)
    {
        this.props.enqueueSnackbar(status,{ 
            variant: 'info',
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
            }
        });
        if(status==='All data uploaded')
            downloadFieldWindow(this.projectId,this.walls,this.windows,this.joints,this.leaks,this.directions, this.onFieldWindowDownloaded);
    }
    getFullListIndex(id:number)
    {
        if(this.rowFullList.length===this.rowList.length)
        {
            return id;
        }
        else
        {
            let row = this.rowList[id];
            for (let i=0;i<this.rowFullList.length;i++){
                if(this.rowFullList[i].id ===row.id)
                    return i;
            }
        }
        return -1;
    }
    onLeakThru(rowId:number,leakId:number)
    {
        let fullListIndex = this.getFullListIndex(rowId);
        this.rowList[rowId].leakId=leakId;
        this.rowFullList[fullListIndex].leakId=leakId;
        if(this.rowList[rowId].status!==1)
        {
            this.rowList[rowId].status = 2;
            this.rowFullList[fullListIndex].status = 2;
            this.setState({isEdited:true})
        }

        markForUpdate( {moduleId:AssessmentTypes.FieldWindow,
            moduleName:'Field Window',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'field-window-'+this.projectId
         },this.rowFullList);


        this.list.current?.scrollToRow(this.rowList.length+10)
        setTimeout(() => {
            this.list.current?.scrollToRow(this.rowList.length+10)
        }, 0);
    }

    onProcessChange(cardIndex: number,id: number,processId: number,rowIndex: number,colIndex: number,oldStatus:number, currentStatus:number){

        if (cardIndex!==-1)
        {
            let fullListIndex = this.getFullListIndex(cardIndex);
            this.rowList[cardIndex].result=currentStatus;
            this.rowFullList[fullListIndex].result=currentStatus;
            if(this.rowList[cardIndex].status!==1)
            {
                this.rowList[cardIndex].status = 2;
                this.rowFullList[fullListIndex].status = 2;
            }
        }

        switch (currentStatus)
        {
            case 1:
                this.compliance++;
                this.checks++;
                break;
            case 2:
                this.compliance--;
                break;
            case 0:
                this.checks--;
                
        }
        this.setState({noOfCompliance:this.compliance,noOfCheck:this.checks,isEdited:true});
        this.onUpdateSummary(this.compliance,this.checks);

        markForUpdate( {moduleId:AssessmentTypes.FieldWindow,
            moduleName:'Field Window',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'field-window-'+this.projectId
         },this.rowFullList);


    }
    onUpdateSummary(noOfCompliance:number, noOfCheck:number)
    {
        if (noOfCheck===0)
        {
            updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.FieldWindow,
                moduleId: 11,moduleName: '',compliances:0,checks:0,percentage:0,weightage:0,score:0,nonCompliance:''})
            return;
        }
        
        let nocompliance='';
        if(noOfCheck>0 && noOfCompliance!==noOfCheck)
        {
            nocompliance = 'Field Window (' + (100.00*noOfCompliance/noOfCheck).toFixed(1) + ' %)'
        }

        updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.FieldWindow,
            moduleId: 11,moduleName: '',compliances:noOfCompliance,checks:noOfCheck,
            percentage:100.00*noOfCompliance/noOfCheck,weightage:0,score:0,nonCompliance:nocompliance})
    }
    onRemove(rowId:number)
    {
        this.deleteDialog.current?.onDialogOpen(rowId);
    }
    onDelete (id: number){
        
        let deleted:IFieldWindow= this.rowList[id];

        if(deleted.result!==0)
        {
            switch (deleted.result)
            {
                case 1:
                    this.compliance--;
                    this.checks--;
                    break;
                case 2:
                    this.checks--;
                    break;
            }
        }

        let fullListIndex = this.getFullListIndex(id);
        this.rowList.splice(id,1);
        this.rowFullList.splice(fullListIndex,1);

        this.setState({rowCount:this.rowList.length,noOfCompliance:this.compliance,noOfCheck:this.checks});

        if(deleted.status!==1)
        {
            markForDeletion( {moduleId:AssessmentTypes.FieldWindow,
                moduleName:'Field Window',
                projectId:this.projectId, 
                projectName:this.state.projectInfo?.name as string,
                key:'field-window-deleted-'+this.projectId
             },deleted.id);

            this.setState({isEdited:true})
        }
        this.onUpdateSummary(this.compliance,this.checks);

        markForUpdate( {moduleId:AssessmentTypes.FieldWindow,
            moduleName:'Field Window',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'field-window-'+this.projectId
         },this.rowFullList);

    }
    onDraw(rowId:number)
    {
        
        this.signatureDialog.current?.onDialogOpen(rowId,this.rowList[rowId].drawing,this.state.canEdit);
    }
    onSign(rowId:number,sign:string)
    {
        if (sign.length>10)
        {
            let fullListIndex = this.getFullListIndex(rowId);
            this.rowList[rowId].drawing=sign;
            this.rowFullList[fullListIndex].drawing=sign;
            if(this.rowList[rowId].status!==1)
            {
                this.rowList[rowId].status = 2;
                this.rowFullList[fullListIndex].status = 2;
            }

            markForUpdate( {moduleId:AssessmentTypes.FieldWindow,
                moduleName:'Field Window',
                projectId:this.projectId,
                projectName:this.state.projectInfo?.name as string,
                key:'field-window-'+this.projectId
            },this.rowFullList); 
            
            this.setState({rowCount:this.rowList.length,isEdited:true})
            
            this.list.current?.scrollToRow(this.rowList.length+10)
            setTimeout(() => {
                if (rowId<5)
                {
                    this.list.current?.forceUpdateGrid();
                   
                }
                this.list.current?.scrollToRow(0)
                this.list.current?.scrollToRow(this.rowList.length+10)
                this.list.current?.scrollToRow(rowId)
            }, 0);
        }
    }

    canAdd(rowList:IFieldWindow[],blockUnit:string,date:string)
    {
        for (let i=0;i<rowList.length;i++){
            if(rowList[i].block===blockUnit && rowList[i].date===date)
                return false
        }
        return true
    }
    onCreate(newData:IFieldWindow)
    {
        if (!this.canAdd(this.rowFullList,newData.block,newData.date))
        {
            this.props.enqueueSnackbar('Can not add dublicate details, this detail already exist.',{ 
                variant: 'warning',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                }
            });
            return;
        }

        newData.id = this.rowFullList.length+1;
        this.rowFullList.push(newData);
        this.rowList.push(newData);
        this.compliance++;
        this.checks++;

        this.setState({rowCount:this.rowList.length,noOfCompliance:this.compliance,noOfCheck:this.checks,isEdited:true});

       
        this.list.current?.scrollToRow(this.rowList.length+10)
        setTimeout(() => {
            this.list.current?.scrollToRow(this.rowList.length+10)
        }, 0);

        markForUpdate( {moduleId:AssessmentTypes.FieldWindow,
            moduleName:'Field Window',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'field-window-'+this.projectId
         },this.rowFullList);

    }
    onSync(status: boolean,message:string)
    {
        if (message.startsWith('Unauthorized'))
            this.props.history.goBack();
        else if (this.state.isEdited===false)
            getProjectHeader(this.projectId,this.onProjectHeaderLoad);  
        else
        {
            this.setState({isEdited:status})
            this.onHeaderClick('NAVIGATE',this.state.navigationPath)
        }
    }
    onNavigation  (location: any, action: any):boolean {
        
        if (getUserInfo().isOffline===false && this.state.isEdited && this.state.navigationPath==='') {
            this.setState({navigationPath:location.pathname})
            this.syncDialog.current?.onDialogOpen();
            return false;
        }
        return true;

      };
    getFirstRow(index:number,cell1:string){
        return (
            <div className='row'>
                <div className='r1-cell-1'><Button className='notes-btn' onClick={(e)=>this.onDraw(index)}>Draw Location <FontAwesomeIcon icon="signature"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button></div>
                <div className='r1-cell-2'>{cell1}</div>
                <div className='r1-cell-3 no-right-border'>
                {this.state.canEdit===true && <Button className='remove-btn' onClick={(e)=>this.onRemove(index)}>Remove <FontAwesomeIcon icon="trash-alt"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>}</div>
            </div>
        );
    }

    getRow(cell1:string,cell2:string, style?:string){
        let rowStyle='row ';
        if (style)
            rowStyle += style;
        return (
            <div className={rowStyle}>
                <div className='cell-1'>{cell1}</div> 
                <div className='cell-2 no-right-border'>{cell2}</div>
            </div>
        );
    }

    getLeakThruRow(index:number, cell2:number, result:number, style?:string){
        let rowStyle='row ';
        let edit = result!==2;
        if (style)
            rowStyle += style;
        return (
            <div className={rowStyle}>
                <div className='cell-1'>Leak Thru</div> 
                <div className='cell-2 no-right-border'>
                    <LeakThrough cardIndex={index} leakId={cell2} leaks={this.leaks} onLeakThru={this.onLeakThru} allowEdit={edit} />
                </div>
            </div>
        );
    }


    renderRow (row:RowRendererParams) {
        let rowData = this.rowList[row.index];
        return (
            <div key={row.key} style={row.style}> 
                <div style={{height:'247px'}}>
                    <div className='assessment-unit unit-row' 
                        style={ row.index % 2 !== 0 ? { backgroundColor:'#FBFBFB',height:'100%',display:'flex',flexDirection:'row',width:this.state.winWidth-20} : 
                        {backgroundColor:'#fff',height:'100%',display:'flex',flexDirection:'row',width:this.state.winWidth-20}}>
                            <div className='unit-one-col1' style={{width:this.state.winWidth-280}}>
                                {this.getFirstRow(row.index,(row.index+1)+'')}
                                {this.getRow('Date',rowData.date)}
                                {this.getRow('Block/Unit',rowData.block)}
                                {this.getRow('Wall',rowData.wallName)}
                                {this.getRow('Window',rowData.windowName)}
                                {this.getRow('Joint',rowData.jointName)}
                                {this.getRow('Direction',rowData.directionName)}
                                {this.getLeakThruRow(row.index,rowData.leakId, rowData.result,'no-bottom-border')}
                            </div>

                            <div className='unit-one-col2'>
 
                                <div className='header no-right-border' style={{height:'30px',textAlign:'center'}}>
                                    <AssessmentButton cardIndex={row.index} rowIndex={0} id={rowData.id}
                                    colIndex={0} processId= {0} result={rowData.result}
                                        onProcessChange ={this.onProcessChange} disabled={!this.state.canEdit}/> 
                                </div>

                                <div style={{paddingTop:'10px'}} >
                                {
                                    (rowData.drawing && rowData.drawing.length>10)?<img src={rowData.drawing} alt='thumpnail' height={200} />
                                    :<span></span>
                                }
                                </div>
                            </div>
                            
                    </div>  
                </div>
            </div>
        );
    }

    render(){
        return (
            
            <div className={'page'}>
                <HeaderPage name={this.state.headerName} ref={this.header}
                projectId={this.projectId} onSearch={(keyword:string)=>this.onSearch(keyword)} 
                add={true} disable={true} onHeaderClick={(action:string, path:string)=>this.onHeaderClick(action,path)}/>

                <div className='assessment-unit unit-row MuiPaper-elevation4' 
                    style={{marginTop:'10px',height:'148px',display:'flex',flexDirection:'column',width:this.state.winWidth-20}}>
                    <div>
                        <div style={{display:'flex',flexDirection:'row'}}> 

                            <div className='unit-one-col1' style={{width:this.state.winWidth-280}}>
                                <div className='cell'>Developer: {this.state.projectInfo?.developer}</div>
                                <div className='cell'>Contractor: {this.state.projectInfo?.contractor}</div>
                                <div className='cell'>Third Party Contractor: {this.state.projectInfo?.contractor}</div>
                                <div className='cell no-bottom-border'>Assessors: {this.state.projectInfo?.assessors}</div>
                            </div>
                            <div className='unit-one-col2'>
                                <div className='compliance' style={{minWidth:'256px'}}>No of compliance: {this.state.noOfCompliance}  </div>
                                <div className='checks' style={{minWidth:'256px'}}>No of checks: {this.state.noOfCheck}</div> 
                                <div className='header' style={{height:'36px'}}>Field Window</div>
                                <div className='header no-bottom-border'>Pass or Fail</div>
                            </div>
                            
                        </div>  
                    </div>
                </div>  
                
                <div style={{height:this.state.winHeight-308,width:this.state.winWidth}} >
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                        ref={this.list}
                        height={height}
                        rowCount={this.state.rowCount}
                        rowHeight={249}
                        rowRenderer={this.renderRow}
                        width={width}
                       
                        overscanRowCount={10} 
                    />
                    )}
                    </AutoSizer>
                </div>

                <div className='assessment-unit unit-row MuiPaper-elevation4' 
                    style={{height:'70px',display:'flex',flexDirection:'row',width:this.state.winWidth-20}}>
                    <div className='unit-one-col1' style={{width:this.state.winWidth-280}}>
                        <div className='cell'>No of checks:</div>
                        <div className='cell no-bottom-border'>No of compliance:</div>
                    </div>
                    <div className='unit-one-col2'>
                        <div className='header no-right-border' style={{height:'36px',textAlign:'center'}}>
                        {this.state.noOfCheck} 
                        </div>
                        <div className='header no-right-border' style={{height:'36px',textAlign:'center'}}>
                        {this.state.noOfCompliance} 
                        </div>
                    </div>
                </div>  
                <DialogDrawing ref={this.signatureDialog} onSign={this.onSign} />
                <DialogAddFieldWindow ref={this.addDialog} onCreate={this.onCreate} />   
                <DialogDeleteConfirm ref={this.deleteDialog} onDelete={this.onDelete} />  
                <DialogSync ref={this.syncDialog} projectId={this.projectId} module={'Field Window'} onSync={this.onSync}/>
                <Prompt
                    when={true}
                    message={(location: any, action: any)=>this.onNavigation(location,action)}
                />   
            </div>

            
        )
    }
}
export default withRouter(withSnackbar(AssessmentFieldWindow))


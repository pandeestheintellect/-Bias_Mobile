
import React from "react"; 
import { Component } from "react";
import { Prompt, RouteComponentProps, withRouter } from "react-router-dom";
import  HeaderPage  from "../components/header-page";
import { AutoSizer, List} from 'react-virtualized'
import { IProject } from "../models/project";
import { AssessmentTypes, markForDeletion, markForUpdate } from "../utilities/assessment-functions";

import Button from "@material-ui/core/Button";

import { getProjectHeader, updateAssessmentWeightage } from "../utilities/project-functions";
import { getModuleProcessMaster } from "../utilities/master-functions";
import { IAssessmentLocation, IAssessmentModuleProcess, IModuleProcess, IProcess } from "../models/assessement";
import { downloadExternalWork, getExternalWork, IExternalWork } from "../utilities/external-work-functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DialogDrawing from "../components/dialogs/dialog-drawing";
import DialogAddExternalWork from "../components/dialogs/dialog-add-external-work";
import { ProviderContext, withSnackbar } from "notistack";
import DialogDeleteConfirm from "../components/dialogs/dialog-delete-confirm";
import AssessmentButton from "../components/assessment-button";
import DialogSync from "../components/dialogs/dialog-sync";
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
    projectInfo:IProject|null,

    rowList:IExternalWork[];
    noOfCompliance:number;
    noOfCheck:number;

    noOfProcessCompliance:number[];
    noOfProcessCheck:number[];
    
    scrollToIndex:number;
    isEdited:boolean;
    navigationPath:string;

    winWidth:number;
    winHeight:number;
    canEdit:boolean;
    headerName:string;
}

class AssessmentExternalWork extends Component<RouteComponentProps<TParams> & ProviderContext,IState> {

    projectId:number;
    compliance:number =0;
    checks:number =0;
    header = React.createRef<HeaderPage>();
    signatureDialog = React.createRef<DialogDrawing>();
    addDialog = React.createRef<DialogAddExternalWork>();
    deleteDialog = React.createRef<DialogDeleteConfirm>();
    syncDialog = React.createRef<DialogSync>();
    process:IModuleProcess[];
    list = React.createRef<List>();
    rowFullList:IExternalWork[];
    
    assessmentLocations:IAssessmentLocation[];
    
    constructor(props:RouteComponentProps<TParams> & ProviderContext) {
        super(props);

        this.projectId = parseInt(this.props.match.params.projectId) ;

        this.onProjectHeaderLoad = this.onProjectHeaderLoad.bind(this);
        this.onModuleProcessMasterDownloaded = this.onModuleProcessMasterDownloaded.bind(this)
        this.onLocationMasterDownloaded = this.onLocationMasterDownloaded.bind(this);
        this.onWorkDownloaded = this.onWorkDownloaded.bind(this);
        this.getFullListIndex = this.getFullListIndex.bind(this);
        this.canAdd = this.canAdd.bind(this);
        this.onSign = this.onSign.bind(this);
        this.onCreate=this.onCreate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onSync = this.onSync.bind(this)
        this.onProcessChange = this.onProcessChange.bind(this);

        this.onUpdateStatus = this.onUpdateStatus.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
       
        this.assessmentLocations=[];
        this.rowFullList=[];
        this.process=[];
        this.state = {
            projectInfo:null,
            
            noOfCompliance:0,
            noOfCheck:0,
            noOfProcessCompliance:[0,0,0,0,0],
            noOfProcessCheck:[0,0,0,0,0],
            rowList:[],
            scrollToIndex:0,
            isEdited:false,
            navigationPath:'',
            winWidth:0,
            winHeight:0,
            canEdit:true,
            headerName:'External Work'

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
        let name =  headerInfo.name===undefined?'External Work':'External Work - '+headerInfo.name;

        if(edit===false)
        {
            name = name + ' (View only)';
            this.header.current?.onBlockEdit();
        }


        this.setState({projectInfo:headerInfo,canEdit:edit,headerName:name})

        getModuleProcessMaster(this.onModuleProcessMasterDownloaded); 
    }

    onModuleProcessMasterDownloaded(moduls:IAssessmentModuleProcess[]|string)
    {
        if(Array.isArray(moduls))
        {
            let mst:IModuleProcess[]=[];
            let locationprocess = moduls.filter(process=>process.assessmentId===AssessmentTypes.ExternalWork);
            let notAdded:boolean;
            locationprocess.forEach(proc=>{
                if(mst.length>0)
                {   
                    notAdded=true;
                    mst.forEach(module=>{
                        if(module.id===proc.locationId)
                        {
                            module.process.push({id:proc.id,name:proc.name})
                            notAdded=false
                        }
                    })

                    if(notAdded)
                        mst.push({id:proc.locationId,name:proc.locationName,process:[{id:proc.id,name:proc.name}]});
                }
                else
                    mst.push({id:proc.locationId,name:proc.locationName,process:[{id:proc.id,name:proc.name}]});
            })
            
            this.process = mst;
            getExternalWork(this.projectId,this.onWorkDownloaded)
        }
        else
            this.onUpdateStatus(moduls as string)
    }

    onLocationMasterDownloaded(moduls:IAssessmentLocation[]|string)
    {
        if(Array(moduls))
        {
            this.assessmentLocations.length=0;
            let process = moduls as IAssessmentLocation[];
            for (let i=0;i<process.length;i++) 
            {
                if (process[i].assessmentId===AssessmentTypes.ExternalWork)
                {
                    this.assessmentLocations.push(process[i])
                }
            }
        }
        else
            this.onUpdateStatus(moduls as string);
    }
    onWorkDownloaded(work:IExternalWork[]|string)
    {
        if(Array.isArray(work))
        {
            let compliance = this.state.noOfProcessCompliance;
            let checks = this.state.noOfProcessCheck;

            this.rowFullList=JSON.parse(JSON.stringify(work));
            

            let colIndex=0;
            if(this.rowFullList.length>0)
            {
                
                for(let i=0;i<this.rowFullList.length;i++)
                {
                    colIndex=-1;
                    
                    for (var j = 0; j < this.rowFullList[i].details.length ; j++) {
            
                        if((j % 2)===0)
                        {
                            colIndex++;
                        }
                            
                        if(this.rowFullList[i].details[j].result!==0)
                        {
                            switch (this.rowFullList[i].details[j].result)
                            {
                                case 1:
                                    this.compliance++;
                                    this.checks++;
                                    compliance[colIndex]++;
                                    checks[colIndex]++;
                                    break;
                                case 2:
                                    this.checks++;
                                    checks[colIndex]++;
                                    break;
                            }
                        }
            
                        
                    }
                }
            }
            else
                this.onUpdateStatus('Details not available add new or sync with server.')

                
            this.setState({rowList:JSON.parse(JSON.stringify(this.rowFullList)),noOfCompliance:this.compliance,
                noOfCheck:this.checks,noOfProcessCompliance:compliance,noOfProcessCheck:checks});

                this.onUpdateSummary(this.compliance,this.checks,compliance,checks);
        }
        else
            this.onUpdateStatus(work as string); 
        
        //removeSyncUploadDetails(this.projectId,this.state.projectInfo?.name as string,'External Work'); 
        
    }
    onSearch(keyword:string){
        if(keyword==='')
            this.setState({rowList:JSON.parse(JSON.stringify(this.rowFullList))})
        else
        {
            keyword =keyword.toLowerCase();
            let lst = this.rowFullList.filter((item:IExternalWork)=>{
                if ((item.id+'').indexOf(keyword)>=0 || item.remark.toLowerCase().indexOf(keyword)>=0 || item.lName.toLowerCase().indexOf(keyword)>=0)
                    return true;
                else
                    return false;
                })
            this.setState({rowList:lst})
        }
    }
    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='NAVIGATE')
            this.props.history.push(path);    
        else if (action==='SYNC')    
        this.props.history.push('/assessment-sync/external-work/'+this.projectId);  
        else if (action==='ADD')  
        {
            if(this.process.length>0)
                this.addDialog.current?.onDialogOpen(this.process);  
            else
                this.onUpdateStatus('Details not available for Process, Please sync Process master with server.')  
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
            downloadExternalWork(this.projectId, this.onWorkDownloaded);
    }
    getFullListIndex(id:number)
    {
        if(this.rowFullList.length===this.state.rowList.length)
        {
            return id;
        }
        else
        {
            let row = this.state.rowList[id];
            for (let i=0;i<this.rowFullList.length;i++){
                if(this.rowFullList[i].id ===row.id)
                    return i;
            }
        }
        return -1;
    }
    onProcessChange(cardIndex: number,id: number,processId: number,rowIndex: number,colIndex: number,oldStatus:number, currentStatus:number){
        let compliance = this.state.noOfProcessCompliance;
        let checks = this.state.noOfProcessCheck;
        let list = this.state.rowList;
        if (cardIndex!==-1)
        {
            let fullListIndex = this.getFullListIndex(cardIndex);
            list[cardIndex].details[rowIndex].result=currentStatus;
            this.rowFullList[fullListIndex].details[rowIndex].result=currentStatus;
            if(list[cardIndex].status!==1)
            {
                list[cardIndex].status = 2;
                this.rowFullList[fullListIndex].status = 2;
            }
        }

        switch (currentStatus)
        {
            case 1:
                this.compliance++;
                this.checks++;
                compliance[colIndex]++;
                checks[colIndex]++;
                break;
            case 2:
                this.compliance--;
                compliance[colIndex]--;
                break;
            case 0:
                this.checks--;
                checks[colIndex]--;
        }
        this.setState({rowList:list, noOfCompliance:this.compliance,noOfCheck:this.checks,noOfProcessCompliance:compliance,
            noOfProcessCheck:checks,isEdited:true});
        this.onUpdateSummary(this.compliance,this.checks,compliance,checks);
        
        markForUpdate( {moduleId:AssessmentTypes.ExternalWork,
            moduleName:'External Work',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'external-work-'+this.projectId
         },this.rowFullList);

    }
    onUpdateSummary(noOfCompliance:number, noOfCheck:number,compliance:number[],checks:number[])
    {
        if (noOfCheck===0)
        {
            updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.ExternalWork,moduleId: 9,
                moduleName: '',compliances:0,checks:0,percentage:0,weightage:0,score:0,nonCompliance:''})
            return;
        }
        let process = this.process;
        let nocompliance='';
        for(let i=0;i<compliance.length;i++)
        {
            if(checks[i]>0 && compliance[i]!==checks[i])
            {
                nocompliance += process[i].name + '(' + (100.00*compliance[i]/checks[i]).toFixed(1) + ' %), '
            }
        }

        updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.ExternalWork,moduleId: 9,
            moduleName: '',compliances:noOfCompliance,checks:noOfCheck,
            percentage:100.00*noOfCompliance/noOfCheck,weightage:0,score:0,nonCompliance:nocompliance})
    }
    onRemove(rowId:number)
    {
        this.deleteDialog.current?.onDialogOpen(rowId);
    }
    onDelete (id: number){
        
        let finalresult:number=-1;
        let compliance = this.state.noOfProcessCompliance;
        let checks = this.state.noOfProcessCheck;
        let list = this.state.rowList;
        let deleted:IExternalWork= list[id];

        for (var i = 0; i < deleted.details.length ; i++) {
            
            if((i % 4)===0)
            {
                finalresult++;
            }

            if(deleted.details[i].result!==0)
            {
                switch (deleted.details[i].result)
                {
                    case 1:
                        this.compliance--;
                        this.checks--;
                        compliance[finalresult]--;
                        checks[finalresult]--;
                        break;
                    case 2:
                        this.checks--;
                        checks[finalresult]--;
                        break;
                }
            }
        }

        let fullListIndex = this.getFullListIndex(id);
        list.splice(id,1);
        this.rowFullList.splice(fullListIndex,1);

        this.setState({rowList:list,noOfCompliance:this.compliance,noOfCheck:this.checks,
                noOfProcessCompliance:compliance,noOfProcessCheck:checks});

        if(deleted.status!==1)
        {
            markForDeletion( {moduleId:AssessmentTypes.ExternalWork,
                moduleName:'External Work',
                projectId:this.projectId, 
                projectName:this.state.projectInfo?.name as string,
                key:'external-work-deleted-'+this.projectId
             },deleted.id);
            
            this.setState({isEdited:true})

        }
        
        markForUpdate( {moduleId:AssessmentTypes.ExternalWork,
            moduleName:'External Work',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'external-work-'+this.projectId
         },this.rowFullList);

        this.onUpdateSummary(this.compliance,this.checks,compliance,checks);
    }
    onDraw(rowId:number)
    {
        this.signatureDialog.current?.onDialogOpen(rowId,this.state.rowList[rowId].drawing,this.state.canEdit);
    }
    onSign(rowId:number,sign:string)
    {
        if (sign.length>10)
        {
            let fullListIndex = this.getFullListIndex(rowId);
            let list = this.state.rowList;
            list[rowId].drawing=sign;
            this.rowFullList[fullListIndex].drawing=sign;
            if(list[rowId].status!==1)
            {
                list[rowId].status = 2;
                this.rowFullList[fullListIndex].status = 2;
            }
            
            markForUpdate( {moduleId:AssessmentTypes.ExternalWork,
                moduleName:'External Work',
                projectId:this.projectId,
                projectName:this.state.projectInfo?.name as string,
                key:'external-work-'+this.projectId
            },this.rowFullList);
            
            this.setState({rowList:list,isEdited:true}); 

            
            this.list.current?.scrollToRow(list.length+10)
            setTimeout(() => {
                if (rowId<5)
                {
                    this.list.current?.forceUpdateGrid();
                   
                }
                
                    this.list.current?.scrollToRow(0)
                    this.list.current?.scrollToRow(list.length+10)
                    this.list.current?.scrollToRow(rowId)
                        
               
            }, 0);
        }
    }
    canAdd(rowList:IExternalWork[],remark:string,date:string,locationId:number)
    {
        for (let i=0;i<rowList.length;i++){
            if(rowList[i].lId ===locationId && rowList[i].remark===remark && rowList[i].date===date)
                return false
        }
        return true
    }
    onCreate(remark:string,date:string,locationId:number,location:string)
    {
        if (!this.canAdd(this.rowFullList,remark,date,locationId))
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

        let noOfCompliance= this.state.noOfProcessCompliance;
        let noOfCheck= this.state.noOfProcessCheck;
        let list = this.state.rowList;

        let workdetail:IExternalWork = {appId:1,id:this.rowFullList.length+1,date:date,remark:remark,
            lId:locationId,lName:location,drawing:'',status:1,details:[]};
        
        let process = this.process.filter(process=>process.id===locationId);

        process[0].process.forEach((pro:IProcess,index:number) => {

                [0,1].forEach((rowNo:number)=>{
                    workdetail.details.push({id:0,pId:pro.id,
                        result:1,row:rowNo+1})
                        noOfCompliance[index]++;
                        noOfCheck[index]++;
                })
            });
            
        this.rowFullList.push(workdetail);
        list.push(workdetail);
        this.compliance +=10;
        this.checks +=10;

        this.setState({rowList:list,noOfCompliance:this.compliance,noOfCheck:this.checks,isEdited:true,
            noOfProcessCompliance:noOfCompliance,noOfProcessCheck:noOfCheck});

        this.list.current?.scrollToRow(list.length+10)
        setTimeout(() => {
            this.list.current?.scrollToRow(list.length+10)
        }, 0);

        
        markForUpdate( {moduleId:AssessmentTypes.ExternalWork,
            moduleName:'External Work',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'external-work-'+this.projectId
         },this.rowFullList);
         
    }

    getFirstRow(index:number,cell1:string){
        return (
            <div className='row'>
                <div className='r1-cell-1'><Button className='notes-btn' onClick={()=>this.onDraw(index)}>Draw Location <FontAwesomeIcon icon="signature"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button></div>
                <div className='r1-cell-2'>{cell1}</div>
                <div className='r1-cell-3 no-right-border'>
                {this.state.canEdit===true && <Button className='remove-btn' onClick={()=>this.onRemove(index)}>Remove <FontAwesomeIcon icon="trash-alt"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>}</div>
            </div>
        );
    }
    getSecondRow(cell1:string,cell2:string)
    {
        return(
            <div className='row'>
                <div className='caption' >Date</div> 
                <div className='detail' >{cell1}</div> 
                <div className='caption' >Location</div> 
                <div className='cell-2 no-right-border'>{cell2}</div>
            </div>

        )
    }
    getThirdRow(cell1:string,cell2:string){
        return ( 
            <div className='row' style={{height:'142px'}}>
                <div className='thumbnail' >{
                    (cell1 && cell1.length>10)?<img src={cell1} alt='thumpnail' height={140} width={159}/>
                    :<span></span>
                }
                </div> 
                <div className='cell-2 no-right-border'>Remark:<br/>{cell2}</div>
            </div>
        );
    }
    getColumn(rowData:IExternalWork,cardIndex:number)
    {
        let process = this.process.filter(process=>process.id===rowData.lId);
        return (
            <div className='unit-one-col2'>
                <div style={{display:'flex',flexDirection:'row',borderBottom:'1px solid gray'}}>
                    {process[0].process.map((pro:IProcess,index:number) => 
                    <div key={index} className={(index+1)===process[0].process.length?'vertical-140 no-right-border':'vertical-140' }  ><span className='vertical-lable-140'>{pro.name}</span></div>
                    )}
                </div>

                <div style={{display:'flex',flexDirection:'column',borderBottom:'1px solid gray'}}>
                    {[0,1].map((rowIndex:number) => 
                        <div key={rowIndex} style={{display:'flex',flexDirection:'row',borderBottom:'1px solid gray'}} className={(rowIndex+1)===2?'no-bottom-border':''}>
                             {process[0].process.map((pro:IProcess,colIndex:number) => 
                            <div key={colIndex}className={colIndex+1===process[0].process.length?'cell no-right-border':'cell'} style={{textAlign:'center'}}>
                            <AssessmentButton cardIndex={cardIndex} rowIndex={rowIndex+(colIndex*2)} id={rowData.details[(colIndex*2)+rowIndex].id}
                            colIndex={colIndex} processId= {rowData.details[(colIndex*2)+rowIndex].pId} result={rowData.details[(colIndex*2)+rowIndex].result}
                                onProcessChange ={this.onProcessChange} disabled={!this.state.canEdit}/> 
                            </div>)}
                        </div>
                    )}

                </div>
                
            </div>

        );
    }
    renderRow (row:RowRendererParams) {
        let rowData = this.state.rowList[row.index];
        return (
            <div key={row.key} style={row.style}>
 
                <div className='assessment-unit unit-row' 
                    style={ row.index % 2 !== 0 ? { backgroundColor:'#FBFBFB',height:'100%',display:'flex',flexDirection:'row',width:this.state.winWidth-30} : 
                    {backgroundColor:'#fff',height:'100%',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                        <div className='unit-one-col1' style={{minWidth:this.state.winWidth-280}}>
                            {this.getFirstRow(row.index,(row.index+1)+'')}
                            {this.getSecondRow(rowData.date,rowData.lName)}
                            {this.getThirdRow(rowData.drawing,rowData.remark)}
                        </div>
                        {this.getColumn(rowData,row.index)}
                </div>  
            </div>
        );
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
        let path =location.pathname;
        if (path.startsWith('/assessment-sync'))
        {
            return true;
        }
        if (getUserInfo().isOffline===false && this.state.isEdited && this.state.navigationPath==='') {
            this.setState({navigationPath:location.pathname})
            this.syncDialog.current?.onDialogOpen();
            return false;
        }
        return true;
      };
    render(){
        return (
            
            <div className={'page'}>
                <HeaderPage name={this.state.headerName} ref={this.header}
                     projectId={this.projectId} onSearch={(keyword:string)=>this.onSearch(keyword)} 
                add={true} disable={true} onHeaderClick={(action:string, path:string)=>this.onHeaderClick(action,path)}/>
                <div className='assessment-unit unit-row MuiPaper-elevation4' 
                    style={{marginTop:'10px',height:'111px',display:'flex',flexDirection:'column',width:this.state.winWidth-30}}>
                    <div>
                        <div style={{display:'flex',flexDirection:'row'}}>

                            <div className='unit-one-col1' style={{minWidth:this.state.winWidth-280}}>
                                <div className='cell'>Developer: {this.state.projectInfo?.developer}</div>
                                <div className='cell'>Contractor: {this.state.projectInfo?.contractor}</div>
                                <div className='cell no-bottom-border'>Assessors: {this.state.projectInfo?.assessors}</div>
                            </div>
                            <div className='unit-one-col2'>
                                <div className='compliance' style={{maxWidth:'247px'}}>No of compliance: {this.state.noOfCompliance}  </div>
                                <div className='checks' style={{maxWidth:'247px'}}>No of checks: {this.state.noOfCheck}</div> 
                                <div className='header no-bottom-border' style={{height:'36px'}}>Criteria</div>
                            </div>
                            
                        </div>  
                    </div>
                </div>
                <div style={{height:this.state.winHeight-272,width:this.state.winWidth-10}} >
                <AutoSizer>
                    {({ height,width }) => (
                        <List
                        ref={this.list}
                        height={height}
                        rowCount={this.state.rowList.length}
                        rowHeight={206}
                        rowRenderer={this.renderRow}
                        width={width}
                       
                        overscanRowCount={10} 
                    />
                    )}
                    </AutoSizer>
                </div>

                <div className='assessment-unit unit-row MuiPaper-elevation4'
                     style={{height:'70px',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                    <div className='unit-one-col1' style={{minWidth:this.state.winWidth-280}}>
                        <div className='cell'>No of checks:</div>
                        <div className='cell no-bottom-border'>No of compliance:</div>
                    </div>
                    <div className='unit-one-col2'>
                        <div style={{display:'flex',flexDirection:'row',borderBottom:'1px solid gray',height:'34px',textAlign:'center'}}>
                                {this.state.noOfProcessCheck.map((check:number,index:number) => 
                                <div key={index} className={(index+1)===this.state.noOfProcessCheck.length?'cell no-right-border':'cell' }>{check}</div>)}
                            </div>
                        
                        <div style={{display:'flex',flexDirection:'row',height:'34px',textAlign:'center'}}>
                            {this.state.noOfProcessCompliance.map((tick:number,index:number) => 
                            <div key={index} className={(index+1)===this.state.noOfProcessCompliance.length?'cell no-right-border':'cell' }>{tick}</div>)}
                        </div>
                    </div>
                </div>  
                
                <DialogDrawing ref={this.signatureDialog} onSign={this.onSign} />   
                <DialogAddExternalWork ref={this.addDialog} onCreate={this.onCreate} />   
                <DialogDeleteConfirm ref={this.deleteDialog} onDelete={this.onDelete} />  
                <DialogSync ref={this.syncDialog} projectId={this.projectId} module={'External Work'} onSync={this.onSync}/>
                <Prompt
                    when={true}
                    message={(location: any, action: any)=>this.onNavigation(location,action)}
                />  
            </div>

            
        )
    }
}
export default withRouter(withSnackbar(AssessmentExternalWork))



import React from "react";
import { Component } from "react";
import { Prompt,RouteComponentProps, withRouter } from "react-router-dom";
import  HeaderPage  from "../components/header-page";
import { AutoSizer, List} from 'react-virtualized'
import { IProject } from "../models/project";
import { AssessmentTypes, markForDeletion, markForUpdate } from "../utilities/assessment-functions";

import Button from "@material-ui/core/Button";

import { getProjectHeader, updateAssessmentWeightage } from "../utilities/project-functions";
import { getModuleProcessMaster } from "../utilities/master-functions";
import {  IAssessmentModuleProcess, IModuleProcess, IProcess } from "../models/assessement";
import { downloadWetArea, getWetArea, IWetArea } from "../utilities/wet-area-functions";
import AssessmentButton from "../components/assessment-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import DialogAddWetArea from "../components/dialogs/dialog-add-wet-area";
import { ProviderContext, withSnackbar } from "notistack";
import DialogDeleteConfirm from "../components/dialogs/dialog-delete-confirm";
import OtherRemark from "../components/other-remark";
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

    noOfProcessCompliance:number[];
    noOfProcessCheck:number[];
    scrollToIndex:number;
    isEdited:boolean;
    navigationPath:string;

    winWidth:number;
    winHeight:number;
    canEdit:boolean;
    headerName:string;
    rowList:IWetArea[];
}

class AssessmentWetArea extends Component<RouteComponentProps<TParams> & ProviderContext,IState> {

    projectId:number;
    compliance:number =0;
    checks:number =0;
    header = React.createRef<HeaderPage>();
    addDialog = React.createRef<DialogAddWetArea>();
    deleteDialog = React.createRef<DialogDeleteConfirm>();
    signatureDialog = React.createRef<DialogDrawing>();
    syncDialog = React.createRef<DialogSync>();
    list = React.createRef<List>();
    rowFullList:IWetArea[];
    
    
    constructor(props:RouteComponentProps<TParams> & ProviderContext) {
        super(props);

        this.projectId = parseInt(this.props.match.params.projectId) ;

        this.onProjectHeaderLoad = this.onProjectHeaderLoad.bind(this);
        this.onModuleProcessMasterDownloaded = this.onModuleProcessMasterDownloaded.bind(this)
        this.onWetAreaDownloaded = this.onWetAreaDownloaded.bind(this);
        this.getFullListIndex = this.getFullListIndex.bind(this);
        this.canAdd = this.canAdd.bind(this);
        this.onSign = this.onSign.bind(this);
        this.onCreate=this.onCreate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onProcessChange = this.onProcessChange.bind(this);
        this.onOtherRemarks = this.onOtherRemarks.bind(this)
        this.onUpdateStatus = this.onUpdateStatus.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.onSync = this.onSync.bind(this)
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this.rowFullList=[]
        
        this.state = {
            projectInfo:null,
            process:undefined,
            noOfCompliance:0,
            noOfCheck:0,
            noOfProcessCompliance:[0,0,0,0,0,0,0,0,0],
            noOfProcessCheck:[0,0,0,0,0,0,0,0,0],
            rowCount:0,
            scrollToIndex:0,
            isEdited:false,
            navigationPath:'',
            winWidth:0,
            winHeight:0,
            canEdit:true,
            headerName:'Wet Area Water Tightness Test (WTT)',
            rowList:[]

          }
         
    }
    componentDidMount()
    {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
        window.addEventListener("orientationchange", this.updateWindowDimensions, false);
        if(getUserInfo().isOffline===true)
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
        let name =  headerInfo.name===undefined?'Wet Area Water Tightness Test (WTT)':'Wet Area Water Tightness Test (WTT) - '+headerInfo.name;

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
            let mst:IModuleProcess|undefined;
            let process = moduls as IAssessmentModuleProcess[];
            for (let i=0;i<process.length;i++) 
            {
                if (process[i].assessmentId===AssessmentTypes.WetArea)
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

            getWetArea(this.projectId,this.onWetAreaDownloaded)
        }
        else
            this.onUpdateStatus(moduls as string)
    }

    onWetAreaDownloaded(wetArea:IWetArea[]|string)
    {
        if(Array.isArray(wetArea))
        {
            let compliance = this.state.noOfProcessCompliance;
            let checks = this.state.noOfProcessCheck;

            this.rowFullList=JSON.parse(JSON.stringify(wetArea));
            
            let row:IWetArea[]=JSON.parse(JSON.stringify(this.rowFullList));

            if(this.rowFullList.length>0)
            {
                
                for(let i=0;i<this.rowFullList.length;i++)
                {
                    for (var j = 0; j < 9 ; j++) {
            
                        if(this.rowFullList[i].details[j].result!==0)
                        {
                            switch (this.rowFullList[i].details[j].result)
                            {
                                case 1:
                                    this.compliance++;
                                    this.checks++;
                                    compliance[j]++;
                                    checks[j]++;
                                    break;
                                case 2:
                                    this.checks++;
                                    checks[j]++;
                                    break;
                            }
                        }
            
                        
                    }
                }
            }
            else
                this.onUpdateStatus('Details not available add new or sync with server.')
            this.setState({rowList:row,noOfCompliance:this.compliance,noOfCheck:this.checks,
                noOfProcessCompliance:compliance,noOfProcessCheck:checks});

                this.onUpdateSummary(this.compliance,this.checks,compliance,checks);
        }
        else
            this.onUpdateStatus(wetArea as string);
        
        //removeSyncUploadDetails(this.projectId,this.state.projectInfo?.name as string,'Wet Area'); 
        
    }
    onSearch(keyword:string){
        this.setState({rowCount:0})
        let row:IWetArea[]=[];
        if(keyword==='')
            row=JSON.parse(JSON.stringify(this.rowFullList))
        else
        {
            keyword =keyword.toLowerCase();
            let lst = this.rowFullList.filter((item:IWetArea)=>{
                if ((item.id+'').indexOf(keyword)>=0 || item.block.toLowerCase().indexOf(keyword)>=0)
                    return true;
                else
                    return false;
                })
                row=JSON.parse(JSON.stringify(lst))    
        }
        this.setState({rowList:row})
    }
    
    onOtherRemarks(rowId:number,remark:string)
    {
        let fullListIndex = this.getFullListIndex(rowId);
        let row = this.state.rowList;
        row[rowId].others=remark;
        this.rowFullList[fullListIndex].others=remark;
        if(row[rowId].status!==1)
        {
            row[rowId].status = 2;
            this.rowFullList[fullListIndex].status = 2;
            this.setState({isEdited:true})
        }

        markForUpdate( {moduleId:AssessmentTypes.WetArea,
            moduleName:'Wet Area',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'wet-area-'+this.projectId
            },this.rowFullList);
        this.setState({rowList:row, isEdited:true})

    }
    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='NAVIGATE')
            this.props.history.push(path);    
        else if (action==='SYNC')    
        this.props.history.push('/assessment-sync/wet-area/'+this.projectId);
        else if (action==='ADD')  
        {
            if(this.state.process?.process)
                this.addDialog.current?.onDialogOpen();     
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
            downloadWetArea(this.projectId, this.onWetAreaDownloaded);
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
        let row = this.state.rowList

        if (cardIndex!==-1)
        {
            let fullListIndex = this.getFullListIndex(cardIndex);


            row[cardIndex].details[rowIndex].result=currentStatus;
            
            if (rowIndex===0)
                rowIndex = colIndex

            this.rowFullList[fullListIndex].details[rowIndex].result=currentStatus;
            if(row[cardIndex].status!==1)
            {
                row[cardIndex].status = 2;
                this.rowFullList[fullListIndex].status = 2;
            }
        }

        if (rowIndex<=8)
        {
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
                    break;
            }
            this.onUpdateSummary(this.compliance,this.checks,compliance,checks);
    
        }
        this.setState({rowList:row, noOfCompliance:this.compliance,noOfCheck:this.checks,noOfProcessCompliance:compliance,
            noOfProcessCheck:checks,isEdited:true});

        markForUpdate( {moduleId:AssessmentTypes.WetArea,
            moduleName:'Wet Area',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'wet-area-'+this.projectId
            },this.rowFullList);
            
    }
    onUpdateSummary(noOfCompliance:number, noOfCheck:number,compliance:number[],checks:number[])
    {
        if (noOfCheck===0)
        {
            updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.WetArea,
                moduleId: 12,moduleName: '',compliances:0,checks:0,percentage:0,weightage:0,score:0,nonCompliance:''})
            return;
        }
        let process = this.state.process?.process as IModuleProcess[];
        let nocompliance='';
        for(let i=0;i<compliance.length;i++)
        {
            if(checks[i]>0 && compliance[i]!==checks[i])
            {
                nocompliance += process[i].name + '(' + (100.00*compliance[i]/checks[i]).toFixed(1) + ' %), '
            }
        }

        updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.WetArea,
            moduleId: 12,moduleName: '',compliances:noOfCompliance,checks:noOfCheck,
            percentage:100.00*noOfCompliance/noOfCheck,weightage:0,score:0,nonCompliance:nocompliance})
    }
    onRemove(rowId:number)
    {
        this.deleteDialog.current?.onDialogOpen(rowId);
    }
    onDelete (id: number){
        let row = this.state.rowList;

        let deleted:IWetArea= row[id];
        let compliance = this.state.noOfProcessCompliance;
        let checks = this.state.noOfProcessCheck;

        for (var i = 0; i < deleted.details.length ; i++) {
            
            if(deleted.details[i].result!==0)
            {
                switch (deleted.details[i].result)
                {
                    case 1:
                        this.compliance--;
                        this.checks--;
                        compliance[i]--;
                        checks[i]--;
                        break;
                    case 2:
                        this.checks--;
                        checks[i]--;
                        break;
                }
            }
        }

        let fullListIndex = this.getFullListIndex(id);
        row.splice(id,1);
        this.rowFullList.splice(fullListIndex,1);

        this.setState({rowList:row,noOfCompliance:this.compliance,noOfCheck:this.checks,
                noOfProcessCompliance:compliance,noOfProcessCheck:checks});

        if(deleted.status!==1)
        {
            markForDeletion( {moduleId:AssessmentTypes.WetArea,
                moduleName:'Wet Area',
                projectId:this.projectId, 
                projectName:this.state.projectInfo?.name as string,
                key:'wet-area-deleted-'+this.projectId
             },deleted.id);

            this.setState({isEdited:true})
            
        }
        this.onUpdateSummary(this.compliance,this.checks,compliance,checks);

        markForUpdate( {moduleId:AssessmentTypes.WetArea,
            moduleName:'Wet Area',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'wet-area-'+this.projectId
            },this.rowFullList);
            
    }
    onDraw(rowId:number)
    {
        this.signatureDialog.current?.onDialogOpen(rowId,this.state.rowList[rowId].drawing,this.state.canEdit);
    }
    onSign(rowId:number,sign:string)
    {
        if (sign.length>10)
        {
            let row=this.state.rowList
            let fullListIndex = this.getFullListIndex(rowId);
            row[rowId].drawing=sign;
            this.rowFullList[fullListIndex].drawing=sign;
            if(row[rowId].status!==1)
            {
                row[rowId].status = 2;
                this.rowFullList[fullListIndex].status = 2;
            }
            
            markForUpdate( {moduleId:AssessmentTypes.WetArea,
                moduleName:'Wet Area',
                projectId:this.projectId,
                projectName:this.state.projectInfo?.name as string,
                key:'wet-area-'+this.projectId
                },this.rowFullList);
                
            this.setState({rowList:row,isEdited:true})

            this.list.current?.scrollToRow(row.length+10)
            setTimeout(() => {
                if (rowId<5)
                {
                    this.list.current?.forceUpdateGrid();
                   
                }
                this.list.current?.scrollToRow(0)
                this.list.current?.scrollToRow(row.length+10)
                this.list.current?.scrollToRow(rowId)
            }, 0);
            
            console.log(rowId)
        }
    }
    canAdd(rowList:IWetArea[],blockUnit:string,date:string)
    {
        for (let i=0;i<rowList.length;i++){
            if(rowList[i].block===blockUnit && rowList[i].date===date)
                return false
        }
        return true
    }
    onCreate(blockUnit:string,date:string,other:string)
    {
        if (!this.canAdd(this.rowFullList,blockUnit,date))
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
        let row = this.state.rowList;
        let noOfCompliance= this.state.noOfProcessCompliance;
        let noOfCheck= this.state.noOfProcessCheck;
        
        let wetAreadetail:IWetArea = {id:this.rowFullList.length+1,date:date,block:blockUnit,
            others:other,drawing:'',status:1,details:[]};
        
        this.state.process?.process.forEach((pro:IProcess,index:number) => {
                    wetAreadetail.details.push({id:0,pId:pro.id,
                        result:1,row:1})
                        noOfCompliance[index]++;
                        noOfCheck[index]++;
            });
        
        this.state.process?.process.forEach((pro:IProcess,index:number) => {
            [1,2,3,4,5,6].map((value:number) => 
                wetAreadetail.details.push({id:0,pId:pro.id,
                result:0,row:value})
                
            )  
        });

        
        this.rowFullList.push(wetAreadetail);
        
        row.push(wetAreadetail);
        this.compliance +=9;
        this.checks +=9;

        this.setState({rowList:row,noOfCompliance:this.compliance,noOfCheck:this.checks,isEdited:true,
            noOfProcessCompliance:noOfCompliance,noOfProcessCheck:noOfCheck});
        this.onUpdateSummary(this.compliance,this.checks,noOfCompliance,noOfCheck);
        
        this.list.current?.scrollToRow(row.length+10)
        setTimeout(() => {
            this.list.current?.scrollToRow(row.length+10)
        }, 0);

        markForUpdate( {moduleId:AssessmentTypes.WetArea,
            moduleName:'Wet Area',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'wet-area-'+this.projectId
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
            //this.setState({isEdited:status})
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
                <div style={{maxWidth:'120px !important',minWidth:'120px !important'}}>
                {this.state.canEdit===true && <Button className='remove-btn' onClick={(e)=>this.onRemove(index)}>Remove <FontAwesomeIcon icon="trash-alt"  style={{fontSize:'20px'}}/></Button>}</div>
                <div className='r1-cell-2'>{cell1}</div>
                <div className='r1-cell-3 no-right-border'>Results  </div> 
            </div>
        );
    }

    getRow(cell1:string,cell2:string,cell3:string,cell4:string){ 
        return (
            <div className='row'>
                <div className='cell-1'>{cell1}</div> 
                <div className='cell-2'>{cell2}</div> 
                <div className='cell-3'>{cell3}</div> 
                <div className='cell-4'>{cell4}</div>  
            </div>
        );
    }

    getResultRow(cell1:string){ 
        return (
            <div className='row'>
                <div className='cell-4'>{cell1}</div>  
            </div>
        );
    }
    getButtonCellStyle(rowIndex:number, colIndex:number)
    {
        let style='cell';
        if ((colIndex+1)===this.state.process?.process.length)
            style += ' no-right-border';
        if (rowIndex===6)
            style += ' double-row-height'    
        return style;

    }
    renderRow (row:RowRendererParams) {
        let rowData = this.state.rowList[row.index];
        return (
            <div key={row.key} style={row.style}>
                <div style={{height:'255px'}}>
                <div className='assessment-unit unit-row' 
                    style={ row.index % 2 !== 0 ? { backgroundColor:'#FBFBFB',height:'100%',display:'flex',flexDirection:'row',width:this.state.winWidth-30} : 
                    {backgroundColor:'#fff',height:'100%',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                        <div className='unit-one-wet-col1'  style={{width:this.state.winWidth-480}}>
                            {this.getFirstRow(row.index,(row.index+1)+'')}
                            <div className='row' style={{fontSize:'10px',height:'100%',padding:'2px'}}>
                                <div style={{width:'35%',borderRight:'1px solid gray'}}>
                                {this.getResultRow('Date: ' +rowData.date)}
                                <div style={{paddingLeft:'4px',paddingTop:'2px',fontSize:'14px'}}>
                                    Block:<br/>{rowData.block}
                                </div>
                                <div style={{width:'100%',borderTop:'1px solid gray'}}>
                                {
                                    (rowData.drawing && rowData.drawing.length>10)?<img src={rowData.drawing} alt='thumpnail' height={90} width={160}/>
                                    :<span></span>
                                }
                                </div>
                                </div>
                                <div style={{width:'65%'}}>
                                    {this.getResultRow('1) Damp/Leak/Seepage at Slab / Soffit')}
                                    {this.getResultRow('2) Damp/Leak/Seepage at Walls')}
                                    {this.getResultRow('3) Leak/Seepage around penetration pipe joints')}
                                    {this.getResultRow('4) Leak/Seepage from discharge pipes, joints, eyes')}
                                    {this.getResultRow('5) Leak from supply pipes, joints, valves tap etc.')}
                                    <OtherRemark key={row.index} cardIndex={row.index} otherRemark={rowData.others} canEdit={this.state.canEdit} onOtherRemarks={this.onOtherRemarks}/>
                                </div>
                            
                            </div>
                        </div>
                        <div className='unit-one-wet-col2'> 
                            {
                                (rowData.details!==undefined && rowData.details.length >9 )  &&   
                                <div style={{display:'flex',flexDirection:'column'}}>
                                    <div key={0} style={{display:'flex',flexDirection:'row',borderBottom:'1px solid gray'}} >
                                        {this.state.process?.process.map((pro:IProcess,colIndex:number) => 
                                        <div key={colIndex}className={(colIndex+1)===this.state.process?.process.length?'cell no-right-border':'cell'} style={{textAlign:'center'}}>
                                        <AssessmentButton cardIndex={row.index} rowIndex={0} id={rowData.details[colIndex].id}
                                        colIndex={colIndex} processId= {rowData.details[colIndex].pId} result={rowData.details[colIndex].result}
                                            onProcessChange ={this.onProcessChange} disabled={!this.state.canEdit}/> 
                                        </div>)}
                                    </div>
                                </div>

                            }
    
                            {[1,2,3,4,5,6].map((value:number) => 
                                <div key={value} style={{display:'flex',flexDirection:'row',borderBottom:'1px solid gray'}} className={(value+1)===7?'no-bottom-border':''}>
                                    {this.state.process?.process.map((pro:IProcess,colIndex:number) => 
                                    <div key={colIndex} className={this.getButtonCellStyle(value,colIndex) } style={{textAlign:'center'}}>
                                    <AssessmentButton cardIndex={row.index} rowIndex={8+value+(colIndex*6)} id={rowData.details[8+value+(colIndex*6)].id}
                                    colIndex={colIndex} processId= {rowData.details[8+value+(colIndex*6)].pId} result={rowData.details[8+value+(colIndex*6)].result}
                                        onProcessChange ={this.onProcessChange} noTick={true} /> 
                                    </div>)}
                                </div>
                            )}  

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
                    style={{marginTop:'10px',height:'161px',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                    <div className='unit-one-wet-col1' style={{width:this.state.winWidth-480}}>
                        
                        <div className='cell'>Developer: {this.state.projectInfo?.developer}</div>
                        <div className='cell'>Contractor: {this.state.projectInfo?.contractor}</div>
                        <div className='cell'>Third Party Contractor: {this.state.projectInfo?.contractor}</div>
                        <div className='cell no-bottom-border'>Witness: {this.state.projectInfo?.assessors}</div>
                    </div>
                    { this.state.process!==undefined && 
                        <div className='unit-one-wet-col2'>
                            <div style={{display:'flex',flexDirection:'row'}}>
                                <div className='compliance'>No of compliance: {this.state.noOfCompliance}  </div> <div className='checks'>No of checks: {this.state.noOfCheck}</div>   
                            </div>
                            <div className='header'>{this.state.process.name}</div>
                            <div style={{display:'flex',flexDirection:'row'}}>
                                {this.state.process.process.map((pro:IProcess,index:number) => 
                                <div key={index} className={(index+1)===this.state.process?.process.length?'vertical-140 no-right-border':'vertical-140' }  ><span className='vertical-lable-140'>{pro.name}</span></div>)}
                            </div>

                        </div>
                    }
                    
                </div>  
                
                <div style={{height:this.state.winHeight-322,width:this.state.winWidth-10}} >
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                        ref={this.list}
                        height={height}
                        rowCount={this.state.rowList.length}
                        rowHeight={260}
                        rowRenderer={this.renderRow}
                        width={width}
                       
                        overscanRowCount={10} 
                    />
                    )}
                    </AutoSizer>
                </div>
                
                <div className='assessment-unit unit-row MuiPaper-elevation4' 
                    style={{height:'70px',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                    <div className='unit-one-wet-col1' style={{width:this.state.winWidth-480}}>
                        <div className='cell'>No of checks:</div>
                        <div className='cell no-bottom-border'>No of compliance:</div>
                    </div>
                    <div className='unit-one-wet-col2'>
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
                <DialogAddWetArea ref={this.addDialog} onCreate={this.onCreate} />   
                <DialogDeleteConfirm ref={this.deleteDialog} onDelete={this.onDelete} />   
                <DialogSync ref={this.syncDialog} projectId={this.projectId} module={'Wet Area'} onSync={this.onSync}/>
                <Prompt
                    when={true}
                    message={(location: any, action: any)=>this.onNavigation(location,action)}
                /> 
            </div>

            
        )
    }
}
export default withRouter(withSnackbar(AssessmentWetArea))


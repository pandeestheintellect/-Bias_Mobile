
import React from "react";
import { Component } from "react";
import { Prompt,RouteComponentProps, withRouter } from "react-router-dom";
import  HeaderPage  from "../components/header-page";
import { AutoSizer, List} from 'react-virtualized'
import { IProject } from "../models/project";
import { AssessmentTypes, markForDeletion, markForUpdate } from "../utilities/assessment-functions";

import Button from "@material-ui/core/Button";

import { getProjectHeader, updateAssessmentWeightage } from "../utilities/project-functions";
import { getLocationMaster, getModuleProcessMaster } from "../utilities/master-functions";
import { IAssessmentLocation, IAssessmentModuleProcess, IModuleProcess, IProcess } from "../models/assessement";
import { downloadRoofConstruction, getRoofConstruction, IRoofConstruction } from "../utilities/roof-construction-functions";
import AssessmentButton from "../components/assessment-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DialogDrawing from "../components/dialogs/dialog-drawing";
import DialogAddRoofConstruction from "../components/dialogs/dialog-add-roof-construction";
import { ProviderContext, withSnackbar } from "notistack";
import DialogDeleteConfirm from "../components/dialogs/dialog-delete-confirm";
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
}

class AssessmentRoofConsctruction extends Component<RouteComponentProps<TParams> & ProviderContext,IState> {

    projectId:number;
    compliance:number =0;
    checks:number =0;
    header = React.createRef<HeaderPage>();
    signatureDialog = React.createRef<DialogDrawing>();
    addDialog = React.createRef<DialogAddRoofConstruction>();
    deleteDialog = React.createRef<DialogDeleteConfirm>();
    syncDialog = React.createRef<DialogSync>();
    
    list = React.createRef<List>();
    rowFullList:IRoofConstruction[];
    rowList:IRoofConstruction[];
    assessmentLocations:IAssessmentLocation[];
    
    constructor(props:RouteComponentProps<TParams> & ProviderContext) {
        super(props);

        this.projectId = parseInt(this.props.match.params.projectId) ;

        this.onProjectHeaderLoad = this.onProjectHeaderLoad.bind(this);
        this.onModuleProcessMasterDownloaded = this.onModuleProcessMasterDownloaded.bind(this)
        this.onLocationMasterDownloaded = this.onLocationMasterDownloaded.bind(this);
        this.onRoofDownloaded = this.onRoofDownloaded.bind(this);
        this.getFullListIndex = this.getFullListIndex.bind(this);
        this.canAdd = this.canAdd.bind(this);
        this.onSync = this.onSync.bind(this)
        this.onCreate=this.onCreate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onProcessChange = this.onProcessChange.bind(this);
        this.onSign = this.onSign.bind(this);
        this.onUpdateStatus = this.onUpdateStatus.bind(this);
        this.renderRow = this.renderRow.bind(this);

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this.assessmentLocations=[];
        this.rowFullList=[]
        this.rowList=[]
        this.state = {
            projectInfo:null,
            process:undefined,
            noOfCompliance:0,
            noOfCheck:0,
            noOfProcessCompliance:[0,0,0,0,0,0],
            noOfProcessCheck:[0,0,0,0,0,0],
            rowCount:0,
            scrollToIndex:0,
            isEdited:false,
            navigationPath:'',
            winWidth:0,
            winHeight:0,
            canEdit:true,
            headerName:'Roof Construction'

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
        let name =  headerInfo.name===undefined?'Roof Construction':'Roof Construction - '+headerInfo.name;

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
                if (process[i].assessmentId===AssessmentTypes.RoofConsctruction)
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
            getLocationMaster(this.onLocationMasterDownloaded); 
            
        }
        else
            this.onUpdateStatus(moduls as string)
    }

    onLocationMasterDownloaded(moduls:IAssessmentLocation[]|string)
    {
        if(Array.isArray(moduls))
        {
            this.assessmentLocations.length=0;
            let process = moduls as IAssessmentLocation[];
            for (let i=0;i<process.length;i++) 
            {
                if (process[i].assessmentId===AssessmentTypes.RoofConsctruction)
                {
                    this.assessmentLocations.push(process[i])
                }
            }
            getRoofConstruction(this.projectId,this.onRoofDownloaded)
        }
        else
            this.onUpdateStatus(moduls as string)
    }
    onRoofDownloaded(Roof:IRoofConstruction[]|string)
    {
        if(Array.isArray(Roof))
        {
            let compliance = this.state.noOfProcessCompliance;
            let checks = this.state.noOfProcessCheck;

            this.rowFullList=JSON.parse(JSON.stringify(Roof));
            this.rowList=JSON.parse(JSON.stringify(this.rowFullList));

            let colIndex=0;
            if(this.rowFullList.length>0)
            {
                
                for(let i=0;i<this.rowFullList.length;i++)
                {
                    colIndex=-1;
                    for (var j = 0; j < this.rowFullList[i].details.length ; j++) {
            
                        if((j % 4)===0)
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

            this.setState({rowCount:this.rowList.length,noOfCompliance:this.compliance,noOfCheck:this.checks,
                noOfProcessCompliance:compliance,noOfProcessCheck:checks});

                this.onUpdateSummary(this.compliance,this.checks,compliance,checks);
        }
        else
            this.onUpdateStatus(Roof as string);
        
        //removeSyncUploadDetails(this.projectId,this.state.projectInfo?.name as string,'Roof Construction'); 
        
    }
    onSearch(keyword:string){
        this.setState({rowCount:0})
        if(keyword==='')
            this.rowList=JSON.parse(JSON.stringify(this.rowFullList))
        else
        {
            keyword =keyword.toLowerCase();
            let lst = this.rowFullList.filter((item:IRoofConstruction)=>{
                if ((item.id+'').indexOf(keyword)>=0 || item.block.toLowerCase().indexOf(keyword)>=0 || item.lName.toLowerCase().indexOf(keyword)>=0)
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
        this.props.history.push('/assessment-sync/roof-construction/'+this.projectId); 
        else if (action==='ADD')  
        {
            if(this.assessmentLocations.length>0)
                this.addDialog.current?.onDialogOpen(this.assessmentLocations);  
            else
                this.onUpdateStatus('Details not available for Location, Please sync Location master with server.')
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
            downloadRoofConstruction(this.projectId, this.onRoofDownloaded);
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
    onProcessChange(cardIndex: number,id: number,processId: number,rowIndex: number,colIndex: number,oldStatus:number, currentStatus:number){
        let compliance = this.state.noOfProcessCompliance;
        let checks = this.state.noOfProcessCheck;
        if (cardIndex!==-1)
        {
            let fullListIndex = this.getFullListIndex(cardIndex);
            this.rowList[cardIndex].details[rowIndex].result=currentStatus;
            this.rowFullList[fullListIndex].details[rowIndex].result=currentStatus;
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
        this.setState({noOfCompliance:this.compliance,noOfCheck:this.checks,noOfProcessCompliance:compliance,
            noOfProcessCheck:checks,isEdited:true});
        this.onUpdateSummary(this.compliance,this.checks,compliance,checks);

        markForUpdate( {moduleId:AssessmentTypes.RoofConsctruction,
            moduleName:'Roof Construction',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'roof-construction-'+this.projectId
        },this.rowFullList);
        
        
    }
    onUpdateSummary(noOfCompliance:number, noOfCheck:number,compliance:number[],checks:number[])
    {
        if (noOfCheck===0)
        {
            updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.RoofConsctruction,
                moduleId: 10,moduleName: '',compliances:0,checks:0,percentage:0,weightage:0,score:0,nonCompliance:''})
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

        updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.RoofConsctruction,
            moduleId: 10,moduleName: '',compliances:noOfCompliance,checks:noOfCheck,
            percentage:100.00*noOfCompliance/noOfCheck,weightage:0,score:0,nonCompliance:nocompliance})
    }
    onRemove(rowId:number)
    {
        this.deleteDialog.current?.onDialogOpen(rowId);
    }
    onDelete (id: number){
        
        let finalresult:number=-1;
        let deleted:IRoofConstruction= this.rowList[id];
        let compliance = this.state.noOfProcessCompliance;
        let checks = this.state.noOfProcessCheck;

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
        this.rowList.splice(id,1);
        this.rowFullList.splice(fullListIndex,1);

        this.setState({rowCount:this.rowList.length,noOfCompliance:this.compliance,noOfCheck:this.checks,
                noOfProcessCompliance:compliance,noOfProcessCheck:checks});

        if(deleted.status!==1)
        {
            markForDeletion( {moduleId:AssessmentTypes.RoofConsctruction,
                moduleName:'Roof Construction',
                projectId:this.projectId, 
                projectName:this.state.projectInfo?.name as string,
                key:'roof-construction-deleted-'+this.projectId
             },deleted.id);

            this.setState({isEdited:true})
           
        }
        this.onUpdateSummary(this.compliance,this.checks,compliance,checks);

        markForUpdate( {moduleId:AssessmentTypes.RoofConsctruction,
            moduleName:'Roof Construction',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'roof-construction-'+this.projectId
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

            markForUpdate( {moduleId:AssessmentTypes.RoofConsctruction,
                moduleName:'Roof Construction',
                projectId:this.projectId,
                projectName:this.state.projectInfo?.name as string,
                key:'roof-construction-'+this.projectId
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
    canAdd(rowList:IRoofConstruction[],blockUnit:string,date:string,locationId:number)
    {
        for (let i=0;i<rowList.length;i++){
            if(rowList[i].lId ===locationId && rowList[i].block===blockUnit && rowList[i].date===date)
                return false
        }
        return true
    }
    onCreate(blockUnit:string,date:string,locationId:number,location:string)
    {
        if (!this.canAdd(this.rowFullList,blockUnit,date,locationId))
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
        
        let roofdetail:IRoofConstruction = {id:this.rowFullList.length+1,date:date,block:blockUnit,
            lId:locationId,lName:location,drawing:'',status:1,details:[]};
        
        this.state.process?.process.forEach((pro:IProcess,index:number) => {

                [0,1,2,3].forEach((rowNo:number)=>{
                    roofdetail.details.push({id:0,pId:pro.id,
                        result:1,row:rowNo+1})
                        noOfCompliance[index]++;
                        noOfCheck[index]++;
                })
            });

        this.rowFullList.push(roofdetail);
        this.rowList.push(roofdetail);
        this.compliance +=24;
        this.checks +=24;

        this.setState({rowCount:this.rowList.length,noOfCompliance:this.compliance,noOfCheck:this.checks,isEdited:true,
            noOfProcessCompliance:noOfCompliance,noOfProcessCheck:noOfCheck});
      
        this.list.current?.scrollToRow(this.rowList.length+10)
        setTimeout(() => {
            this.list.current?.scrollToRow(this.rowList.length+10)
        }, 0);

        markForUpdate( {moduleId:AssessmentTypes.RoofConsctruction,
            moduleName:'Roof Construction',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'roof-construction-'+this.projectId
        },this.rowFullList);

        console.log(this.rowFullList)

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
    getFirstRow(index:number,cell1:string,cell3:string){
        return (
            <div className='row'>
                <div className='r1-cell-1'><Button className='notes-btn' onClick={(e)=>this.onDraw(index)}>Draw Location <FontAwesomeIcon icon="signature"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button></div>
                <div className='r1-cell-2'>{cell1}</div>
                <div className='r1-cell-3'>
                {this.state.canEdit===true && <Button className='remove-btn' onClick={(e)=>this.onRemove(index)}>Remove <FontAwesomeIcon icon="trash-alt"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>}</div>
                <div className='cell-3'>{cell3}</div>    
            </div>
        );
    }

    
    getRow(rowDetail:IRoofConstruction){
        return (
            <div style={{display:'flex',flexDirection:'row',height:'92px',borderBottom:'1px solid gray'}}>
                <div style={{width:'140px',borderRight:'1px solid gray'}}>
                {
                    (rowDetail.drawing && rowDetail.drawing.length>10)?<img src={rowDetail.drawing} alt='thumpnail' height={90} width={140}/>
                    :<span></span>
                }
                </div>
                <div>
                    <div style={{display:'flex',flexDirection:'row',height:'30px',width:'100%',borderBottom:'1px solid gray'}}>
                        <div style={{width:'70px',paddingTop:'2px',paddingLeft:'4px', borderRight:'1px solid gray'}}>Date</div> 
                        <div style={{width:this.state.winWidth-605, paddingTop:'2px',paddingLeft:'4px', borderRight:'1px solid gray'}}>{rowDetail.date}</div>
                        <div style={{width:'50px',paddingTop:'2px',paddingLeft:'4px'}}>R 2</div>   
                    </div>
                    <div style={{display:'flex',flexDirection:'row',height:'30px',width:'100%',borderBottom:'1px solid gray'}}>
                        <div style={{width:'70px',paddingTop:'2px',paddingLeft:'4px', borderRight:'1px solid gray'}}>Block</div> 
                        <div style={{width:this.state.winWidth-605,paddingTop:'2px',paddingLeft:'4px', borderRight:'1px solid gray'}}>{rowDetail.block}</div>
                        <div style={{width:'50px',paddingTop:'2px',paddingLeft:'4px'}}>R 3</div>   
                    </div>
                    <div style={{display:'flex',flexDirection:'row',height:'30px',width:'100%',borderBottom:'1px solid gray'}}>
                        <div style={{width:'70px',paddingTop:'2px',paddingLeft:'4px', borderRight:'1px solid gray'}}>Location</div> 
                        <div style={{width:this.state.winWidth-605,paddingTop:'2px',paddingLeft:'4px', borderRight:'1px solid gray'}}>{rowDetail.lName}</div>
                        <div style={{width:'50px',paddingTop:'2px',paddingLeft:'4px'}}>R 4</div>   
                    </div>
                </div>
            </div>
        );
    }

    renderRow (row:RowRendererParams) {
        let rowData = this.rowList[row.index];
        return (
            <div key={row.key} style={row.style}>

                <div className='assessment-unit unit-row' 
                    style={ row.index % 2 !== 0 ? { backgroundColor:'#FBFBFB',height:'100%',display:'flex',flexDirection:'row',width:this.state.winWidth-30} : 
                    {backgroundColor:'#fff',height:'100%',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                        <div className='unit-one-roof-col1' style={{minWidth:this.state.winWidth-330}}>
                            {this.getFirstRow(row.index,(row.index+1)+'','R 1')}
                            {this.getRow(rowData)}
                        </div> 
                        <div className='unit-one-roof-col2'>
                            {
                                rowData.details!==undefined &&  <div style={{display:'flex',flexDirection:'column',borderBottom:'1px solid gray'}}>
                                {[0,1,2,3].map((index:number) => 
                                    <div key={index} style={{display:'flex',flexDirection:'row',borderBottom:'1px solid gray'}} className={(index+1)===4?'no-bottom-border':''}>
                                        {this.state.process?.process.map((pro:IProcess,colIndex:number) => 
                                        <div key={colIndex}className={(colIndex+1)===this.state.process?.process.length?'cell no-right-border':'cell'} style={{textAlign:'center'}}>
                                        <AssessmentButton cardIndex={row.index} rowIndex={index+(colIndex*4)} id={rowData.details[(colIndex*4)+index].id}
                                        colIndex={colIndex} processId= {rowData.details[(colIndex*4)+index].pId} result={rowData.details[(colIndex*4)+index].result}
                                            onProcessChange ={this.onProcessChange} disabled={!this.state.canEdit}/> 
                                        </div>)}
                                    </div>
                                )}

                            </div>

                            }
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
                    style={{marginTop:'10px',height:'198px',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                    <div className='unit-one-roof-col1' style={{minWidth:this.state.winWidth-330}}>
                        <div style={{display:'flex',flexDirection:'row'}}>
                            <div className='compliance'>No of compliance: {this.state.noOfCompliance}  </div> <div className='checks'>No of checks: {this.state.noOfCheck}</div>   
                        </div>
                        
                        <div className='cell'>Developer: {this.state.projectInfo?.developer}</div>
                        <div className='cell'>Contractor: {this.state.projectInfo?.contractor}</div>
                        <div className='cell no-bottom-border'>Assessors: {this.state.projectInfo?.assessors}</div>
                    </div>
                    { this.state.process!==undefined &&
                        <div className='unit-one-roof-col2'>
                            <div className='header'>{this.state.process.name}</div>
                            <div style={{display:'flex',flexDirection:'row'}}>
                                {this.state.process.process.map((pro:IProcess,index:number) => 
                                <div key={index} className={(index+1)===this.state.process?.process.length?'vertical-140 no-right-border':'vertical-140' }  ><span className='vertical-lable-140'>{pro.name}</span></div>)}
                            </div>

                        </div>
                    }
                    
                </div>  
                
                <div style={{height:this.state.winHeight-346,width:this.state.winWidth-10}} >
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                        ref={this.list} 
                        height={height}
                        rowCount={this.state.rowCount}
                        rowHeight={125}
                        rowRenderer={this.renderRow}
                        width={width}
                       
                        overscanRowCount={10} 
                    />
                    )}
                    </AutoSizer>
                </div>

                <div className='assessment-unit unit-row MuiPaper-elevation4' 
                    style={{height:'70px',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                    <div className='unit-one-roof-col1' style={{minWidth:this.state.winWidth-330}}>
                        <div className='cell'>No of checks:</div>
                        <div className='cell no-bottom-border'>No of compliance:</div>
                    </div>
                    <div className='unit-one-roof-col2'>
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
                <DialogAddRoofConstruction ref={this.addDialog} onCreate={this.onCreate} />   
                <DialogDeleteConfirm ref={this.deleteDialog} onDelete={this.onDelete} /> 
                <DialogSync ref={this.syncDialog} projectId={this.projectId} module={'Roof Construction'} onSync={this.onSync}/>
                <Prompt
                    when={true}
                    message={(location: any, action: any)=>this.onNavigation(location,action)}
                />             
            </div>

            
        )
    }
}
export default withRouter(withSnackbar(AssessmentRoofConsctruction))


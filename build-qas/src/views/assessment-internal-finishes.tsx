
import React from "react";
import { Component } from "react"; 
import { Prompt,RouteComponentProps, withRouter } from "react-router-dom";
import  HeaderPage  from "../components/header-page";
import { AutoSizer, List} from 'react-virtualized'
import {IAssessmentWeightage, IProject } from "../models/project";
import { AssessmentTypes, markForDeletion, markForUpdate } from "../utilities/assessment-functions";
import Button from "@material-ui/core/Button";

import { getProjectHeader,  updateAssessmentWeightage, updateMultipleAssessmentWeightage } from "../utilities/project-functions";
import { IAssessmentLocation, IAssessmentModuleProcess, IModuleProcess, IProcess  } from "../models/assessement";
import { getLocationMaster, getModuleProcessMaster } from "../utilities/master-functions";
import { downloadInternalFinishes, getInternalFinishes, IInternalFinishes} from "../utilities/internal-finishes-functions";
import { ProviderContext, withSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AssessmentButton from "../components/assessment-button";
import DialogAddInternalFinishes from "../components/dialogs/dialog-add-internal-finishes";
import DialogDeleteConfirm from "../components/dialogs/dialog-delete-confirm";
import Divider from "@material-ui/core/Divider";
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

interface IHeadStat {
    id:number,
    compliance:number,
    checks:number
}
interface IFootStat {
    id:number,
    compliance:number[],
    checks:number[]
}

interface IState {
    projectInfo:IProject|null;
    process:IModuleProcess[]|undefined;
    headerStat:IHeadStat[];
    footerStat:IFootStat[];
    locationType:number[];
    rowCount:number;
    showMore:boolean;
    headerHeight:string;
    projectMenuAnchor: Element|null;
    projectMenuOpen:boolean;
    projectCurrentRow:any;
    scrollToIndex:number;
    isEdited:boolean;
    navigationPath:string;

    winWidth:number;
    winHeight:number;
    canEdit:boolean;
    headerName:string;
}

class AssessmentInternalFinishes extends Component<RouteComponentProps<TParams> & ProviderContext,IState> {

    projectId:number;  
    header = React.createRef<HeaderPage>();
    addDialog = React.createRef<DialogAddInternalFinishes>();
    deleteDialog = React.createRef<DialogDeleteConfirm>();
    syncDialog = React.createRef<DialogSync>();

    list = React.createRef<List>();
    rowFullList:IInternalFinishes[];
    rowList:IInternalFinishes[];
    assessmentLocations:IAssessmentLocation[];
    
    
    constructor(props:RouteComponentProps<TParams> & ProviderContext) {
        super(props);

        this.projectId = parseInt(this.props.match.params.projectId) ;
        
        this.renderRow = this.renderRow.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
       
        this.rowFullList=[];
        this.rowList=[];
        this.assessmentLocations=[];
        this.state = {
            projectInfo:null,
            process:undefined,
            headerStat:[],
            footerStat:[],
            locationType:[0,0,0],
            rowCount:0,
            showMore:false,
            headerHeight:'261px',
            projectMenuAnchor: null,
            projectMenuOpen:false,
            projectCurrentRow:{},
            scrollToIndex:0,
            isEdited:false,
            navigationPath:'',
            winWidth:0,
            winHeight:0,
            canEdit:true,
            headerName:'Internal Finishes'
          }
         
          this.onProjectHeaderLoad = this.onProjectHeaderLoad.bind(this);
          this.onLocationMasterDownloaded = this.onLocationMasterDownloaded.bind(this);
          this.onModuleProcessMasterDownloaded = this.onModuleProcessMasterDownloaded.bind(this)
          this.onInternalFinisheskDownloaded = this.onInternalFinisheskDownloaded.bind(this)
          
          this.onUpdateStatus = this.onUpdateStatus.bind(this);
          this.canAdd = this.canAdd.bind(this);
          this.onCreate=this.onCreate.bind(this);
          this.onDelete = this.onDelete.bind(this);
          this.onProcessChange = this.onProcessChange.bind(this);
          this.onSync = this.onSync.bind(this)
          
          
          this.renderRow = this.renderRow.bind(this);

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
        let name =  headerInfo.name===undefined?'Internal Finishes':'Internal Finishes - '+headerInfo.name;

        if(edit===false)
            name = name + ' (View only)';

        this.setState({projectInfo:headerInfo,canEdit:edit,headerName:name})
    
        if(edit===false)
        {
            this.header.current?.onBlockEdit();
            //getInternalFinishes(this.projectId,this.onInternalFinisheskDownloaded)
            getModuleProcessMaster(this.onModuleProcessMasterDownloaded); 
        }
        else
        {
            getLocationMaster(this.onLocationMasterDownloaded); 
            getModuleProcessMaster(this.onModuleProcessMasterDownloaded); 
    
        }
    
    }
    onLocationMasterDownloaded(moduls:IAssessmentLocation[]|string)
    {
        if(Array.isArray(moduls))
        {
            this.assessmentLocations.length=0;
            let process = moduls as IAssessmentLocation[];
            for (let i=0;i<process.length;i++) 
            {
                if (process[i].assessmentId===AssessmentTypes.InternalFinishes)
                {
                    this.assessmentLocations.push(process[i])
                }
            }
        }
        else
            alert(moduls);
    }
    onModuleProcessMasterDownloaded(moduls:IAssessmentModuleProcess[]|string)
    {
        if(Array.isArray(moduls))
        {
            let header = this.state.headerStat;
            let footer = this.state.footerStat;
            
            let mst:IModuleProcess[]=[];
            let locationprocess = moduls.filter(process=>process.assessmentId===AssessmentTypes.InternalFinishes);
            let notAdded:boolean=true;
            locationprocess.forEach(proc=>{
                if(mst.length>0)
                {   
                    notAdded=true;
                    mst.forEach((module,index)=>{
                        if(module.id===proc.moduleId)
                        {
                            module.process.push({id:proc.id,name:proc.name})
                            notAdded=false
                        }
                    })

                    if(!notAdded)
                    {
                        footer.forEach(module=>{
                            if(module.id===proc.moduleId)
                            {
                                module.compliance.push(0)
                                module.checks.push(0)
                            }
                        })  
                    }
                }
                
                if(notAdded)
                {
                    header.push({id:proc.moduleId,compliance:0,checks:0})
    
                    footer.push({id:proc.moduleId,compliance:[0],checks:[0]})

                    mst.push({id:proc.moduleId,name:proc.moduleName,process:[{id:proc.id,name:proc.name}]});
                }
                    
            })
            
            this.setState({process:mst,headerStat:header,footerStat:footer}) ;
            getInternalFinishes(this.projectId,this.onInternalFinisheskDownloaded)
        }
        else
            alert(moduls);
        
    }

    onInternalFinisheskDownloaded(internal:IInternalFinishes[]|string)
    {
        if(Array.isArray(internal))
        {
            let header = this.state.headerStat;
            let footer = this.state.footerStat;
            let psc = this.state.locationType;

            this.rowFullList=JSON.parse(JSON.stringify(internal));
            this.rowList=JSON.parse(JSON.stringify(this.rowFullList));
            let moduleIndex=0;
            let colIndex=0;
            if(this.rowFullList.length>0)
            {
                for(let i=0;i<this.rowFullList.length;i++)
                {
                    moduleIndex=-1;
                    colIndex=0;
                    if(this.rowFullList[i].lType==='P')
                        psc[0]++;
                    else if(this.rowFullList[i].lType==='S')
                        psc[1]++;
                    else if(this.rowFullList[i].lType==='C')
                        psc[2]++;    
                    for (var j = 0; j < this.rowFullList[i].details.length ; j++) {
            
                        if(j===10) j=15;

                        if((j % 5)===0)
                        {
                            moduleIndex++;
                        }

                        if((j % 5)===0)
                        {
                            colIndex=0;
                        }

                        if(this.rowFullList[i].details[j].result!==0 && header.length>moduleIndex)
                        {
                            switch (this.rowFullList[i].details[j].result)
                            {
                                case 1:
                                    header[moduleIndex].compliance++;
                                    header[moduleIndex].checks++;
                                    footer[moduleIndex].compliance[colIndex]++;
                                    footer[moduleIndex].checks[colIndex]++;
                                    break;
                                case 2:
                                    header[moduleIndex].checks++;
                                    footer[moduleIndex].checks[colIndex]++;
                                    break;
                            }
                        }
                        if(moduleIndex===1 && this.rowFullList[i].details[j+5].result!==0)
                        {
                            switch (this.rowFullList[i].details[j+5].result)
                            {
                                case 1:
                                    header[moduleIndex].compliance++;
                                    header[moduleIndex].checks++;
                                    footer[moduleIndex].compliance[colIndex]++;
                                    footer[moduleIndex].checks[colIndex]++;
                                    break;
                                case 2:
                                    header[moduleIndex].checks++;
                                    footer[moduleIndex].checks[colIndex]++;
                                    break;
                            }
                        }

                        colIndex++;
                    }
                }
            }
            else
                this.onUpdateStatus('Details not available add new or sync with server.')

            this.setState({rowCount:this.rowList.length,headerStat:header,footerStat:footer,locationType:psc});
            for (let i=0;i<7;i++)
                this.onUpdateSummary(i, header[i].compliance, header[i].checks,footer[i].compliance,footer[i].checks);
        }
        else
            this.onUpdateStatus(internal as string);
        
    
        
    }

    onSearch(keyword:string){
        if(keyword==='')
            this.rowList=JSON.parse(JSON.stringify(this.rowFullList))
        else
        {
            let lst = this.rowFullList.filter((item:IInternalFinishes)=>{
                if ((item.id+'').indexOf(keyword)>0 || item.block.indexOf(keyword)>0 || item.lName.indexOf(keyword)>0)
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
            this.props.history.push('/assessment-sync/internal-finishes/'+this.projectId); 
        else if (action==='ADD')  
            this.addDialog.current?.onDialogOpen(this.assessmentLocations);               
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
            downloadInternalFinishes(this.projectId, this.onInternalFinisheskDownloaded);
    }
    canAdd(rowList:IInternalFinishes[],blockUnit:string,date:string,locationId:number)
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

        let header = this.state.headerStat;
        let footer = this.state.footerStat;
        let psc = this.state.locationType;

        let internaldetail:IInternalFinishes = {id:this.rowFullList.length+1,date:date,block:blockUnit,
            lId:locationId,lName:location,status:1,lType:'', details:[]};

        if(location.endsWith('(P)')){
            internaldetail.lType='P';
            psc[0]++}
        else if(location.endsWith('(S)')){
            internaldetail.lType='S';
            psc[1]++}
        else if(location.endsWith('(C)')){
            internaldetail.lType='C';
            psc[2]++}

        this.state.process?.forEach((module:IModuleProcess,row:number) => {

            module.process.forEach((process:IProcess, col:number)=>{
                header[row].compliance++;
                header[row].checks++;
                footer[row].compliance[col]++;
                footer[row].checks[col]++;
                internaldetail.details.push({id:0,pId:process.id,result:1,row:1})
                if(row===1){
                    header[row].compliance++;
                    header[row].checks++;
                    footer[row].compliance[col]++;
                    footer[row].checks[col]++;
                    internaldetail.details.push({id:0,pId:process.id,result:1,row:2})
                }
            })
        });

        this.rowFullList.push(internaldetail);
        this.rowList.push(internaldetail);

        this.setState({rowCount:this.rowList.length,headerStat:header,footerStat:footer,locationType:psc,isEdited:true});
        
        let changes:IAssessmentWeightage[]=[]
        for (let i=0;i<7;i++)
            changes.push(this.getSummary(i, header[i].compliance, header[i].checks,footer[i].compliance,footer[i].checks));
        
        updateMultipleAssessmentWeightage(this.projectId,changes);
        
        markForUpdate( {moduleId:AssessmentTypes.InternalFinishes,
            moduleName:'Internal Finishes',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'internal-finishes-'+this.projectId
         },this.rowFullList);

        this.list.current?.scrollToRow(this.rowList.length+10)
        setTimeout(() => {
            this.list.current?.scrollToRow(this.rowList.length+10)
        }, 0);
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
    onProcessChange1(cardIndex: number,id: number,processId: number,rowIndex: number,colIndex: number,oldStatus:number, currentStatus:number){
        console.log(cardIndex+' , ' + id+' , ' + processId+' , ' + rowIndex+' , ' + colIndex +' , ' + (rowIndex/5>>0) +' , ' + (rowIndex%5) +' , ' + currentStatus);
    }
    onProcessChange(cardIndex: number,id: number,processId: number,rowIndex: number,colIndex: number,oldStatus:number, currentStatus:number){
        
        //console.log(cardIndex+' , ' + id+' , ' + processId+' , ' + rowIndex+' , ' + colIndex +' , row:' + (rowIndex/5>>0) +' , col:' + (rowIndex%5)  +' , ' + currentStatus);
        let header = this.state.headerStat;
        let footer = this.state.footerStat;

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

        let row = (rowIndex/5>>0);
        if (row>1) row--;
        let col = (rowIndex%5);
        if (row===1)
        {
            if (rowIndex===5 ||rowIndex===6 )
                col=0;
            else if (rowIndex===7 ||rowIndex===8 )
                col=1;
            else if (rowIndex===9 ||rowIndex===10 )
                col=2;        
            else if (rowIndex===11 ||rowIndex===12 )
                col=3;
            else if (rowIndex===13 ||rowIndex===15 )
                col=4;    
        }
                
        /*

        let col = (rowIndex%5);
        if (row===1)
        {
            if(col<=1)
                col=0
            else if(col>1 && col<=3)
                col=1    
            else if(col>3 && col<=5)
                col=2  
            else if(col>5 && col<=7)
                col=3                                  
            else if(col>7 && col<=9)
                col=4                  
        }
        */
        //console.log(col)

        switch (currentStatus)
        {
            case 1:
                header[row].compliance++;
                header[row].checks++;
                footer[row].compliance[col]++;
                footer[row].checks[col]++;
                break;
            case 2:
                header[row].compliance--;
                footer[row].compliance[col]--;
                break;
            case 0:
                header[row].checks--;
                footer[row].checks[col]--;
                
        }
        this.setState({headerStat:header,footerStat:footer,isEdited:true});
        this.onUpdateSummary(row, header[row].compliance, header[row].checks,footer[row].compliance,footer[row].checks);
        markForUpdate( {moduleId:AssessmentTypes.InternalFinishes,
            moduleName:'Internal Finishes',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'internal-finishes-'+this.projectId
         },this.rowFullList);
       
    }

    onUpdateSummary(index:number, noOfCompliance:number, noOfCheck:number,compliance:number[],checks:number[])
    {
        if (this.state.process)
        {
            let process = this.state.process[index] as IModuleProcess;

            

        if (noOfCheck===0)
        {
            updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.InternalFinishes,
                moduleId:process.id, moduleName: '',compliances:0,checks:0,percentage:0,weightage:0,score:0,nonCompliance:''})
            return;
        }
        
        let nocompliance='';
        for(let i=0;i<compliance.length;i++)
        {
            if(checks[i]>0 && compliance[i]!==checks[i])
            {
                nocompliance += process.process[i].name + '(' + (100.00*compliance[i]/checks[i]).toFixed(1) + ' %), '
            }
        }

        updateAssessmentWeightage(this.projectId,{typeId:AssessmentTypes.InternalFinishes,
            moduleId: process.id,moduleName: '',compliances:noOfCompliance,checks:noOfCheck,
            percentage:100.00*noOfCompliance/noOfCheck,weightage:0,score:0,nonCompliance:nocompliance})
        }
        
    }

    getSummary(index:number, noOfCompliance:number, noOfCheck:number,compliance:number[],checks:number[])
    {
        if (this.state.process )
        {
            let process = this.state.process[index] as IModuleProcess;

            if (noOfCheck===0)
            {
                return {typeId:AssessmentTypes.InternalFinishes,
                    moduleId:process.id, moduleName: '',compliances:0,checks:0,percentage:0,weightage:0,score:0,nonCompliance:''};
            }
            
            let nocompliance='';
            for(let i=0;i<compliance.length;i++)
            {
                if(checks[i]>0 && compliance[i]!==checks[i])
                {
                    nocompliance += process.process[i].name + '(' + (100.00*compliance[i]/checks[i]).toFixed(1) + ' %), '
                }
            }

            return {typeId:AssessmentTypes.InternalFinishes,
                moduleId: process.id,moduleName: '',compliances:noOfCompliance,checks:noOfCheck,
                percentage:100.00*noOfCompliance/noOfCheck,weightage:0,score:0,nonCompliance:nocompliance}
        }
        else
            return {typeId:AssessmentTypes.InternalFinishes,
                moduleId: 0,moduleName: '',compliances:noOfCompliance,checks:noOfCheck,
                percentage:100.00*noOfCompliance/noOfCheck,weightage:0,score:0,nonCompliance:''}
        
    }
    onRemove(rowId:number)
    {
        this.deleteDialog.current?.onDialogOpen(rowId);
    }
    onDelete (id: number){

        let deleted:IInternalFinishes= this.rowList[id];
   
        let header = this.state.headerStat;
        let footer = this.state.footerStat;
        let psc = this.state.locationType;

        let moduleIndex=-1;
        let colIndex=0;
        if(deleted.lType==='P'){
            psc[0]--}
        else if(deleted.lType==='S'){
            psc[1]--}
        else if(deleted.lType==='C'){
            psc[2]--}

        for (var j = 0; j < deleted.details.length ; j++) {
        
            if(j===10) j=15;

            if((j % 5)===0)
            {
                moduleIndex++;
            }

            if((j % 5)===0)
            {
                colIndex=0;
            }

            if(deleted.details[j].result!==0)
            {
                switch (deleted.details[j].result)
                {
                    case 1:
                        header[moduleIndex].compliance--;
                        header[moduleIndex].checks--;
                        footer[moduleIndex].compliance[colIndex]--;
                        footer[moduleIndex].checks[colIndex]--;
                        break;
                    case 2:
                        header[moduleIndex].checks--;
                        footer[moduleIndex].checks[colIndex]--;
                        break;
                }
            }
            if(moduleIndex===1 && deleted.details[j+5].result!==0)
            {
                switch (deleted.details[j+5].result)
                {
                    case 1:
                        header[moduleIndex].compliance--;
                        header[moduleIndex].checks--;
                        footer[moduleIndex].compliance[colIndex]--;
                        footer[moduleIndex].checks[colIndex]--;
                        break;
                    case 2:
                        header[moduleIndex].checks--;
                        footer[moduleIndex].checks[colIndex]--;
                        break;
                }
            }

            colIndex++;
        }

        let fullListIndex = this.getFullListIndex(id);
        this.rowList.splice(id,1);
        this.rowFullList.splice(fullListIndex,1);

        this.setState({rowCount:this.rowList.length,headerStat:header,footerStat:footer,locationType:psc});
        //this.onUpdateSummary(moduleIndex, header[moduleIndex].compliance, header[moduleIndex].checks,footer[moduleIndex].compliance,footer[moduleIndex].checks);

        let changes:IAssessmentWeightage[]=[]
        for (let i=0;i<7;i++)
            changes.push(this.getSummary(i, header[i].compliance, header[i].checks,footer[i].compliance,footer[i].checks));
        
        updateMultipleAssessmentWeightage(this.projectId,changes);
        
        if(deleted.status!==1)
        {
            markForDeletion( {moduleId:AssessmentTypes.InternalFinishes,
                moduleName:'Internal Finishes',
                projectId:this.projectId,
                projectName:this.state.projectInfo?.name as string,
                key:'internal-finishes-deleted-'+this.projectId
             },deleted.id);

            this.setState({isEdited:true})
            
        }

        markForUpdate( {moduleId:AssessmentTypes.InternalFinishes,
            moduleName:'Internal Finishes',
            projectId:this.projectId,
            projectName:this.state.projectInfo?.name as string,
            key:'internal-finishes-'+this.projectId
         },this.rowFullList);
        
    }

    onShowMore(show:boolean)
    {
        let height='261px';
        if (show)
            height='350px';
        this.setState({showMore:show,headerHeight:height})
        
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
    getFirstRow(index:number, rowData:any){
        return (
            <div className='unit-one-infi-row-header'>
                <div className='cell-1'>{index+1}</div>
                <div className='cell-2'>Date: {rowData.date}</div>
                <div className='cell-3'>Block: {rowData.block}</div>
                <div className='cell-4'>Location: {rowData.lName}</div>
                <div className='cell-5'>Type: {rowData.lType}</div>
                {this.state.canEdit===true && <div className='cell-6'><Button className='remove-btn' onClick={(e)=>this.onRemove(index)}>Remove <FontAwesomeIcon icon="trash-alt"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button></div> } 
            </div>
        );
    }

    getRow(rowData:any,foot:IFootStat,rowIndex:number,index:number){
        if (index===1)
            return (
                <div key={index} style={{maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row',border:'1px solid gray'}}>
                    {
                        foot.checks.map((check:number, colIndex:number)=>
                        <div key={colIndex}style={{textAlign:'center',width:'29px',borderRight:'1px solid gray'}} >
                        <AssessmentButton cardIndex={rowIndex} rowIndex={(index*5)+(colIndex*2)} id={rowData.details[(index*5)+(colIndex*2)].id}
                        colIndex={(index*5)+colIndex} processId= {rowData.details[(index*5)+(colIndex*2)].pId} result={rowData.details[(index*5)+(colIndex*2)].result}
                        backgroud ={index % 2 !== 1 ? 'auc-tool-null-alternate':''}    onProcessChange ={this.onProcessChange} 
                        disabled={!this.state.canEdit}/> 
                        <Divider></Divider>
                        <AssessmentButton cardIndex={rowIndex} rowIndex={(index*5)+((colIndex*2)+1)} id={rowData.details[(index*5)+((colIndex*2)+1)].id}
                        colIndex={(index*5)+colIndex} processId= {rowData.details[(index*5)+((colIndex*2)+1)].pId} result={rowData.details[(index*5)+((colIndex*2)+1)].result}
                        backgroud ={index % 2 !== 1 ? 'auc-tool-null-alternate':''}    onProcessChange ={this.onProcessChange} 
                        disabled={!this.state.canEdit}/> 
                        </div>)

                       
                    }
                </div>
            );
        else
        {
            let actualIndex=index;
            if (index>0) index++;
            return (
                <div key={index} style={ actualIndex % 2 !== 1 ? { backgroundColor:'#e7e7e7',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row',border:'1px solid gray'} : 
                {backgroundColor:'#fff',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row',border:'1px solid gray'}}
                >
                    {
                        foot.checks.map((check:number, colIndex:number)=>
                        <div  key={colIndex} style={{textAlign:'center',width:'29px',borderRight:'1px solid gray'}}>
                        <AssessmentButton cardIndex={rowIndex} rowIndex={(index*5)+colIndex} id={rowData.details[(index*5)+colIndex].id}
                        colIndex={(actualIndex*5)+colIndex} processId= {rowData.details[(index*5)+colIndex].pId} result={rowData.details[(index*5)+colIndex].result}
                        backgroud ={actualIndex % 2 !== 1 ? 'auc-tool-null-alternate':''} onProcessChange ={this.onProcessChange} 
                        disabled={!this.state.canEdit}/> 
                        </div>)
                    } 

                </div>
            );

        }
    }

    renderRow (row:RowRendererParams) {
        let rowData = this.rowList[row.index];
        return (
            <div key={row.key} style={row.style}>
    
                <div className='assessment-unit unit-row' 
                    style={{backgroundColor:'white',marginTop:'10px',height:'260px',display:'flex',flexDirection:'row',minWidth:this.state.winWidth-28}}>
                        <div style={{padding:8, display:'flex',flexDirection:'column',minWidth:this.state.winWidth-1120}}>
                            <div style={{display:'flex',flexDirection:'row',lineHeight:'1.4em',marginBottom:6}}>
                                <div style={{width:'35%',fontSize:'1.1em',fontWeight:500}}>Date:</div>
                                <div style={{width:'35%'}}>{rowData.date}</div>
                                <div style={{width:'30%',textAlign:'center',fontSize:'1.2em',fontWeight:600}}>{row.index+1}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row',lineHeight:'1.4em',marginBottom:6}}>
                                <div style={{width:'35%',fontSize:'1.1em',fontWeight:500}}>Block:</div>
                                <div style={{width:'65%'}}>{rowData.block}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row',lineHeight:'1.4em',marginBottom:6}}>
                                <div style={{width:'35%',fontSize:'1.1em',fontWeight:500}}>Location:</div>
                                <div style={{width:'65%'}}>{rowData.lName}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row' ,lineHeight:'1.4em'}}>
                                <div style={{width:'35%',fontSize:'1.1em',fontWeight:500}}>Type:</div>
                                <div style={{width:'25%'}}>{rowData.lType}</div>
                                <div style={{width:'40%',textAlign:'right'}}>
                                {this.state.canEdit===true &&
                                    <Button className='remove-btn' onClick={(e)=>this.onRemove(row.index)}>Remove <FontAwesomeIcon icon="trash-alt" 
                                         style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                                }
                                </div>
                            </div>
                        </div>
                        
                        <div className='assessment-unit unit-row' 
                            style={ row.index % 2 !== 0 ? {border:'1px solid gray', backgroundColor:'#FBFBFB',height:'100%',display:'flex',flexDirection:'column'} : 
                            {border:'1px solid gray',backgroundColor:'#fff',height:'100%',display:'flex',flexDirection:'column'}}>
                            <div style={{border:'1px solid gray',display:'flex',flexDirection:'row',maxWidth:'150px',minWidth:'150px',height:'48px'}}>
                                {this.state.footerStat.map((foot:IFootStat,colIndex:number)=>
                                
                                this.getRow(rowData,foot,row.index,colIndex)
                                
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
                <HeaderPage name={this.state.headerName} 
                    projectId={this.projectId} onSearch={(keyword:string)=>this.onSearch(keyword)} ref={this.header}
                    add={true} disable={true} onHeaderClick={(action:string, path:string)=>this.onHeaderClick(action,path)}/>
                
                <div className='assessment-unit unit-row MuiPaper-elevation4' 
                    style={{marginTop:'10px',height:'260px',display:'flex',flexDirection:'row',width:this.state.winWidth-30}}>
                        <div className='unit-one-infi-header-column' style={{display:'flex',flexDirection:'column'}}>
                            <div style={{display:'flex',flexDirection:'row'}}>
                                <div className='unit-one-infi-header-column' style={{maxWidth:'40px',minWidth:'40px'}}>
                                    <div className='cell'>P</div> 
                                    <div className='cell'>S</div>
                                    <div className='cell'>C</div>
                                </div>
                                <div className='unit-one-infi-header-column' style={{width:this.state.winWidth-1284}}>
                                    <div className='cell'>{this.state.locationType[0]}</div>
                                    <div className='cell'>{this.state.locationType[1]}</div>
                                    <div className='cell'>{this.state.locationType[2]}</div>
                                </div>
                                <div className='unit-one-infi-header-column' style={{maxWidth:'150px',minWidth:'150px'}}>
                                    <div className='cell'>No. of compliance	</div>
                                    <div className='cell'>No. of checks	</div>
                                    <div className='cell'> -</div>
                                </div>

                            </div>
                            <div style={{display:'flex',flexDirection:'column',background:'white',padding:8,border:'1px solid gray'}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Developer:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400,marginBottom:6}}>{this.state.projectInfo?.developer}</div>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Contractor:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400,marginBottom:6}}>{this.state.projectInfo?.contractor}</div>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Assessors:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectInfo?.assessors}</div>
                            </div>
                        </div>
                        
                        <div className='unit-one-infi-header-column' style={{display:'flex',flexDirection:'row'}}>
                        {
                            this.state.process?.map((module:IModuleProcess,index:number) => 
                                <div key={index} style={{border:'1px solid gray',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'column'}}>
                                    <div className='cell'>{this.state.headerStat[index].compliance}</div>
                                    <div className='cell'>{this.state.headerStat[index].checks}</div>   
                                    <div className='cell'>{module.name}</div>
                                    <div>
                                        <div style={ index % 2 !== 1 ? {border:'1px solid gray', backgroundColor:'#e7e7e7',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row'} : 
                                                    {border:'1px solid gray',backgroundColor:'#fff',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row'}}>
                                            {module.process.map((process:IProcess,colindex:number) => 
                                                <div key={colindex} className='vertical-170 width-29'><span className='vertical-lable-170'>{process.name}</span></div>
                                            )}
                                        </div>
                                    </div>   
                                    
                                </div>
                            )
                        }    
                        </div>

                </div>

                <div style={{height:this.state.winHeight-434,width:this.state.winWidth-10,marginTop:8}} >
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                            ref={this.list}
                            height={height}
                            rowCount={this.state.rowCount}
                            rowHeight={130}
                            rowRenderer={this.renderRow}
                            width={width}
                            overscanRowCount={10} 
                        />
                        )}
                    </AutoSizer>
                </div>

                
                <div className='assessment-unit unit-row MuiPaper-elevation4' 
                    style={{height:'80px',display:'flex',flexDirection:'column',width:this.state.winWidth-30, marginTop:4}}>

                    <div style={{display:'flex',flexDirection:'row',height:'40px'}}>
                        <div style={{padding:8, minWidth:this.state.winWidth-1110,border:'1px solid gray'}}>
                            No of checks
                        </div>
                        {this.state.footerStat.map((foot:IFootStat,index:number)=>
                        
                        <div key={index} style={ index % 2 !== 1 ? { backgroundColor:'#e7e7e7',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row',border:'1px solid gray'} : 
                            {backgroundColor:'#fff',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row',border:'1px solid gray'}}
                            >
                                {
                                    foot.checks.map((check:number, colIndex:number)=>
                                    <div key={colIndex} style={{display:'inline-flex', alignItems:'center',justifyContent:'center', width:'29px',borderRight:'1px solid gray',fontSize:'12px'}} >
                                        {check}
                                    </div>)
                                } 

                            </div>
                        
                        )}
                    </div>
                    <div style={{display:'flex',flexDirection:'row',height:'40px'}}>
                        <div style={{padding:8, minWidth:this.state.winWidth-1110,border:'1px solid gray'}}>
                            No of Complaince
                        </div>
                        {this.state.footerStat.map((foot:IFootStat,index:number)=>
                        
                        <div key={index} style={ index % 2 !== 1 ? { backgroundColor:'#e7e7e7',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row',border:'1px solid gray'} : 
                            {backgroundColor:'#fff',maxWidth:'150px',minWidth:'150px',display:'flex',flexDirection:'row',border:'1px solid gray'}}
                            >
                                {
                                    foot.compliance.map((check:number, colIndex:number)=>
                                    <div key={colIndex} style={{display:'inline-flex', alignItems:'center',justifyContent:'center', width:'29px',borderRight:'1px solid gray',fontSize:'12px'}}  >
                                        {check}
                                    </div>)
                                } 

                            </div>
                        
                        )}
                    </div>
                
                
                    </div>
                

                <DialogAddInternalFinishes ref={this.addDialog} onCreate={this.onCreate} />   
                <DialogDeleteConfirm ref={this.deleteDialog} onDelete={this.onDelete} />  
                <DialogSync ref={this.syncDialog} projectId={this.projectId} module={'Internal Finishes'} onSync={this.onSync}/>
                <Prompt
                    when={true}
                    message={(location: any, action: any)=>this.onNavigation(location,action)}
                />           
            </div>

            
        ) 
    }
}
export default withRouter(withSnackbar(AssessmentInternalFinishes))


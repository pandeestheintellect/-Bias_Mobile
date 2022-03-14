
import React from "react";
import { Component } from "react";


import { IProject } from "../models/project";
import { Button, List, Paper } from "@material-ui/core";
import {  downloadProjectList, getProjectList, updateProject } from "../utilities/project-functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItem } from "@material-ui/core";
import DialogSubmissionConfirm from "./dialogs/dialog-submission-confirm";
import { getUserInfo } from "../utilities/user-functions";
import DialogDownloadAssessment from "./dialogs/dialog-download-assessment";
import DialogPDFViewer from "./dialogs/dialog-pdf-viewer";


interface IProps {
    status:string;
    goBack?:true;
    onHeaderClick:(action:string, path:string)=>void
}
interface IState {
    projectList:IProject[];
    rowCount:number;
    confirmProject:number;

    projectMenuAnchor: Element|null;
    projectMenuOpen:boolean;
    projectCurrentRow:any;
}

class CardAssessment extends Component<IProps,IState> {
    
    dialogSubmission = React.createRef<DialogSubmissionConfirm>();
    dialogDownload = React.createRef<DialogDownloadAssessment>();
    dialogPdf = React.createRef<DialogPDFViewer>();
    projectFullList:IProject[];

    constructor(props:IProps) {
        super(props);
        this.onShowSubmission = this.onShowSubmission.bind(this)
        this.onLoad = this.onLoad.bind(this)
        this.onUpdateStatus = this.onUpdateStatus.bind(this)
        this.onDataDownloaded = this.onDataDownloaded.bind(this)
        this.onSaveOffline = this.onSaveOffline.bind(this)
        this.onDownloadCompleted = this.onDownloadCompleted.bind(this);
        this.onSubmission = this.onSubmission.bind(this)
        this.projectFullList=[];
        
        this.state = {
            projectList:[],
            rowCount:0,
            confirmProject:-1,

            projectMenuAnchor: null,
            projectMenuOpen:false,
            projectCurrentRow:{}
          }
         
    }
    
    componentDidMount()
    {
        getProjectList(this.onDataDownloaded);  
    }
    onLoad()
    {
        if (getUserInfo().isOffline===true)
            getProjectList (this.onDataDownloaded);  
        else
            downloadProjectList (this.onDataDownloaded);  
    }

    onDataDownloaded(projectInfo:IProject[])
    {
        let fullList:IProject[]=JSON.parse(JSON.stringify(projectInfo))
        let list:IProject[] =[];

        this.projectFullList=[];
        
        if (this.props.status!== 'ALL')
        {
            fullList.forEach(project=>{
                if(project.status=== this.props.status)
                {
                    this.projectFullList.push(project);
                    list.push(project);
                }
            })
    
        }
        else
        {
            this.projectFullList  =JSON.parse(JSON.stringify(projectInfo));
            list = JSON.parse(JSON.stringify(projectInfo));
        }        
        this.setState({projectList:list})
    }
    onSearch(keyword:string){
        
        let list:IProject[]=[]; 
        if(keyword==='')
        list=JSON.parse(JSON.stringify(this.projectFullList))
        else
        {
            keyword = keyword.toUpperCase();
            let lst = this.projectFullList.filter((item:IProject)=>{
                if ((item.name+item.developer+item.contractor+item.assessors).toUpperCase().indexOf(keyword)>=0)
                    return true;
                else
                    return false;
                })
                list=JSON.parse(JSON.stringify(lst))   
        }
       
        this.setState({projectList:list})
    }
    onSaveOffline(id:number)
    {
        this.dialogDownload.current?.onDialogOpen(id);
    }
    onDownloadCompleted(status: boolean,message:string)
    {
        console.log(message)
    }
    onShowSubmission(id:number)
    {
        this.setState({confirmProject:id})
        //this.dialogSubmission.current?.onDialogOpen(id)
    }
    onNoSubmission()
    {
        this.setState({confirmProject:-1})
        //this.dialogSubmission.current?.onDialogOpen(id)
    }
    onSubmission()
    {
       updateProject(this.state.confirmProject,this.onUpdateStatus)
    }
    onUpdateStatus(status:string)
    {
        this.onLoad();
        this.setState({confirmProject:-1})
    }

    onHeaderClick(action:string, path:string){
        let actualPath=path===undefined?'':path;

        if(this.props.goBack!==undefined && this.props.goBack===true)
            actualPath +='/listing'

      
        this.props.onHeaderClick(action, actualPath);
    }

    onPDF(id:number)
    {
        window.open('https://buildqas-global.com/Report/PrintAssessmentSummaryReportToPdf?ProjectID='+id + '&SessionId='+getUserInfo().sessionID);
        //this.dialogPdf.current?.onDialogOpen('https://buildqas-global.com/Report/PrintAssessmentSummaryReportToPdf?ProjectID='+id + '&SessionId='+getUserInfo().sessionID)
    }

    renderListItem(project:IProject,index:number)
    {
        if (this.state.confirmProject===parseInt(project.id))
        return (
            <ListItem key={index}>
                <Paper style={{padding:16,width:'100%'}}>
                    <div style={{display:'flex',flexDirection:'row'}}>
                        <div style={{display:'flex',flexDirection:'column',width:'80%'}}>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Name:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.name}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Developer:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.developer}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Contractor:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.contractor}</div>
                            </div>

                        </div>
                    </div>
                    <Paper style={{display:'flex',flexDirection:'column',width:'100%', textAlign:'center',alignItems:'center'}}>
                        <div style={{width:'100%',fontSize:'1.2em',lineHeight:'1.4em',color:'#F16876',fontWeight:600,margin:20}}>
                            Are you sure for confirming the submission? No further changes will be allowed.
                        </div>
                            <div style={{width:'100%',fontSize:'1.1em',lineHeight:'1.4em',color:'#F16876',fontWeight:500,margin:10}}>
                            Click Okay to continue </div>
                        <div style={{display:'flex',flexDirection:'row',marginBottom:20}}>
                            <Button  color='primary' style={{marginRight:'30px'}} onClick={()=>this.onSubmission()} 
                        variant="contained">Okay <FontAwesomeIcon icon="check-double"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                    <Button  style={{color:'white',backgroundColor:'#F16876'} } onClick={()=>this.onNoSubmission()}
                        variant="contained">Cancel <FontAwesomeIcon icon="ban"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                        </div>
                    </Paper>
                </Paper>
            </ListItem>
        )
        else
        return (
            <ListItem key={index}>
                <Paper style={{padding:16,width:'100%'}}>
                    <div style={{display:'flex',flexDirection:'row'}}>
                        <div style={{display:'flex',flexDirection:'column',width:'80%'}}>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Name:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.name}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Developer:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.developer}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Contractor:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.contractor}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Assessors:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.assessors}
                                    {project.assessorType==='Co-Assessor'&& <span style={{color:'red',marginLeft:10}}>(Your are Co Assessor)</span>}
                                </div>

                            </div>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Date:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.dateOfAssessment}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Type:</div>
                                <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{project.type}</div>
                            </div>

                        </div>
                        <div style={{display:'flex',flexDirection:'column',width:'20%',justifyContent:'center',alignItems:'center'}}>
                            <div style={{marginBottom:10}}>
                                <Button  variant="contained" style={{backgroundColor:'#55acee', color:'white',width:250,justifyContent: "flex-start"}}  
                                onClick={()=>this.onHeaderClick('NAVIGATE','/assessment-summary/'+project.id)}>
                                <FontAwesomeIcon icon="drafting-compass" style={{marginRight:'20px',fontSize:'26px'}}/>  Assessment </Button>
                            </div>
                            <div >
                                {
                                    (project.status !=='Completed' && getUserInfo().isOffline===false) &&
                                    
                                    <Button  variant="contained"  color="primary" 
                                        style={{backgroundColor:'#ac2bac', color:'white',width:250,marginBottom:10,justifyContent: "flex-start"}}
                                    onClick={()=>this.onSaveOffline(parseInt( project.id))}
                                    >
                                    
                                    <FontAwesomeIcon icon="save" style={{marginRight:'20px',fontSize:'26px'}}/>Save for Offline </Button>
                                    
                                }
                            </div>
                            <div >
                                {
                                    (project.status !=='Completed' && getUserInfo().isOffline===false) &&
                                    
                                    <Button  variant="contained"  color="primary" 
                                    style={{backgroundColor:'#009688', color:'white',width:250,marginBottom:10,justifyContent: "flex-start"}}
                                    onClick={()=>this.onShowSubmission(parseInt( project.id))}
                                    >
                                    
                                    <FontAwesomeIcon icon="check-double" style={{marginRight:'20px',fontSize:'26px'}}/>  Confirm Submission </Button>
                                    
                                }
                                {
                                    project.status ==='Completed' && <h2 style={{color:'#F16876'}}>Status: Completed</h2>
                                }

                            </div>

                            <div >
                                {
                                    (getUserInfo().isOffline===false) &&
                                    
                                    <Button  variant="contained"  color="primary" style={{width:250,justifyContent: "flex-start"}}
                                    onClick={()=>this.onPDF(parseInt( project.id))}
                                    >
                                    
                                    <FontAwesomeIcon icon="file-pdf" style={{marginRight:'20px',fontSize:'26px'}}/>  Download Report </Button>
                                    
                                }
                                

                            </div>

                        </div>
                    </div>

                </Paper>
            </ListItem>
        )
    }
    render(){
        return (
            
            <div >
                <List>
                    {this.state.projectList.map((project:IProject,index:number)=>this.renderListItem(project,index))}
                </List>
                <DialogSubmissionConfirm ref={this.dialogSubmission} onSubmission={this.onUpdateStatus}/>
                <DialogDownloadAssessment ref={this.dialogDownload} onDownloadCompleted={this.onDownloadCompleted}/>
                <DialogPDFViewer ref={this.dialogPdf}/>
            </div>
        )
    }
}
export default CardAssessment ;

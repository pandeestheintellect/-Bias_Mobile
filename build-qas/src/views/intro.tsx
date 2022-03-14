
import { Button } from '@material-ui/core';
import { CircularProgress } from '@material-ui/core';
import logo from '../images/logo-buildqas.png';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { LinearProgressWithLabel } from '../components/linear-progress';
import { IAssessmentLocation, IAssessmentModule, IAssessmentModuleProcess,  IJoint, ILeak, IWall, IWindow } from '../models/assessement';
import { IProject } from '../models/project';
import { checkOnline, downloadJointMaster, downloadLeakMaster, downloadLocationMaster, downloadModuleMaster, downloadModuleProcessMaster, 
    downloadWallMaster, downloadWindowMaster} from '../utilities/master-functions';
import { downloadProjectList } from '../utilities/project-functions';
import { getUserInfo } from '../utilities/user-functions';
import { IAssessmentKey, onOfflineActivitySyncCompleted, onSyncOfflineActivity } from '../utilities/assessment-functions';

import CardAssessemtSync from '../components/card-assessment-sync';


type TParams = { projectId: string,module: string };

interface IState {
    status:string[];
    detailAdd:any[];
    allDone:boolean;
    progress:number;
    remarks:string;
    isUploading:boolean;
    uploadingProgress:number;
    uploadingRemarks:string;
    assessmentKey:IAssessmentKey[];
    currentKeyIndex:number;

}
class AssessmentSync extends Component<RouteComponentProps<TParams>,IState > {
 
    cardSync = React.createRef<CardAssessemtSync>();

    constructor(props:RouteComponentProps<TParams> )
    {
        super(props)
        
        this.state = {
            status:[],
            detailAdd:[],
            allDone:false,
            progress:0,
            remarks:'Checking for updates',
            isUploading:false,
            uploadingProgress:0,
            uploadingRemarks:'Checking for updates',
            assessmentKey:[],
            currentKeyIndex:0
        }
        this.onUpdateStatus = this.onUpdateStatus.bind(this);
        this.onUploadStatus = this.onUploadStatus.bind(this);

        this.onModuleMasterDownloaded = this.onModuleMasterDownloaded.bind(this);
        this.onLocationMasterDownloaded = this.onLocationMasterDownloaded.bind(this);
        this.onModuleProcessMasterDownloaded = this.onModuleProcessMasterDownloaded.bind(this);

        this.onWallMasterLoad = this.onWallMasterLoad.bind(this);
        this.onWindowMasterLoad = this.onWindowMasterLoad.bind(this);
        this.onJointMasterLoad = this.onJointMasterLoad.bind(this);
        this.onLeakMasterLoad = this.onLeakMasterLoad.bind(this);
        this.onProjectListLoad = this.onProjectListLoad.bind(this);
        this.onSync=this.onSync.bind(this)
        this.isOnline = this.isOnline.bind(this)
    }
    componentDidMount()
    {
        checkOnline(this.isOnline)
        
    }
    isOnline(status:boolean)
    {
        if (status)
            downloadModuleMaster(this.onModuleMasterDownloaded);
        else
            this.setState({remarks:'No Internet connection. Continue with offline mode..',progress:100,allDone:true})
    }
    onUpdateStatus(processStatus:string)
    {   
        //console.log('log ' +processStatus)
    }
    onUploadStatus(processStatus:string)
    {
        console.log('log ' +processStatus)
   
        if (processStatus==='Completed')
        {
            let key = this.state.assessmentKey;
            let index = this.state.currentKeyIndex+1;
            if (key.length>index)
            {
                this.setState({currentKeyIndex:index,uploadingRemarks: 'Uploading '+ key[index].projectName +'\'s ' +key[index].moduleName })
                console.log('Uploading '+ key[index].projectName +'\'s ' +key[index].moduleName)
                this.cardSync.current?.doSync(key[index]);
            }
            else
                this.props.history.push('/dashboard'); 
        }
    }
    onModuleMasterDownloaded(moduls:IAssessmentModule[]|string)
    {
        if(Array.isArray(moduls))
        {
            this.setState({remarks:'Starting with Masters downloaded',progress:12})
            downloadLocationMaster(this.onLocationMasterDownloaded);
        }
        else
            this.onUpdateStatus(moduls as string)
    }
    onLocationMasterDownloaded(moduls:IAssessmentLocation[]|string)
    {
        if(Array.isArray(moduls))
        {
            this.setState({progress:24})
            downloadModuleProcessMaster(this.onModuleProcessMasterDownloaded); 
        }
        else
            this.onUpdateStatus(moduls as string)
    }
    onModuleProcessMasterDownloaded(moduls:IAssessmentModuleProcess[]|string)
    {
        if(Array.isArray(moduls))
        {
            this.setState({progress:36})
            downloadWallMaster(this.onWallMasterLoad);  
        }
        else
            this.onUpdateStatus(moduls as string)
    }

    onWallMasterLoad(wallMaster:IWall[]|string)
    {
        if(Array.isArray(wallMaster))
        {
            this.setState({remarks:'Reaching halfway mark',progress:48})
            downloadWindowMaster(this.onWindowMasterLoad);
        }
        else
            this.onUpdateStatus(wallMaster as string)
        
    }
    onWindowMasterLoad(windowMaster:IWindow[]|string)
    {
        
        if(Array.isArray(windowMaster))
        {
            this.setState({progress:60})
            downloadJointMaster(this.onJointMasterLoad);

        }
        else
            this.onUpdateStatus(windowMaster as string)
    }
    onJointMasterLoad(jointMaster:IJoint[]|string)
    {
        if(Array.isArray(jointMaster))
        {
            this.setState({progress:72})
            downloadLeakMaster(this.onLeakMasterLoad);
        }
        else
            this.onUpdateStatus(jointMaster as string)
        
    }
    onLeakMasterLoad(leakMaster:ILeak[]|string)
    {
        
        if(Array.isArray(leakMaster))
        {
            this.setState({remarks:'Almost done',progress:84})
            downloadProjectList(this.onProjectListLoad);
        }
        else
            this.onUpdateStatus(leakMaster as string)
    }
    onProjectListLoad(projects:IProject[])
    {
        
        this.setState({remarks:'Download completed',progress:100,isUploading:true, uploadingProgress:0, uploadingRemarks:'checking offline activities to be uploaded...'})

        setTimeout(() => {
            onSyncOfflineActivity(this.onSync);   
        }, 100);
        
    }
    
    onSync(activities:string)
    {
        console.log(activities)
        if (!activities.startsWith('No activity'))
        {
            
            if(activities!==undefined)
            {
                let key:IAssessmentKey[]=[];

                key = JSON.parse(activities as string);
                
                this.setState({assessmentKey:key,uploadingRemarks: 'Uploading '+ key[0].projectName +'\'s ' +key[0].moduleName })
                console.log('Uploading '+ key[0].projectName +'\'s ' +key[0].moduleName)
                this.cardSync.current?.doSync(key[0]);

                /*
                if(key.length>0)
                assessmentKey.forEach(activity=>{
                    console.log('Uploading '+ activity.projectName +'\'s ' +activity.moduleName)
                    this.setState({uploadingRemarks: 'Uploading '+ activity.projectName +'\'s ' +activity.moduleName })
                    this.cardSync.current?.doSync(activity);
                })
                */
                onOfflineActivitySyncCompleted()
            }
        }
        else
        {
            this.setState({uploadingProgress:100, uploadingRemarks:'no offline activities to be uploaded...'})
            this.props.history.push('/dashboard'); 
        }
        
        
    }

    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='NAVIGATE')
            this.props.history.push(path);    
      
    }
    render() {
        return (
            <div className={'page'}>
                <div style={{fontSize:'18px'}}>
                    <Toolbar style={{backgroundColor: '#F16876',color: '#FFF'}} >
                        <img src={logo} alt="Logo" height={40} style={{marginRight:20}}/>
                        <Typography variant="h6" >Welcome  {getUserInfo().userName} </Typography>
                        
                    </Toolbar>
                </div>
                <div style={{margin:'50px',width:'90%'}}>
                    <Typography variant="h6" style={{marginBottom:'20px'}}>{this.state.remarks}</Typography>
                    {this.state.isUploading===false && <CircularProgress />}
                    
                    <LinearProgressWithLabel value={this.state.progress}/>
                </div>
                {
                    this.state.isUploading && 
                        <div style={{margin:'50px',width:'90%'}}>
                            <Typography variant="h6" style={{marginBottom:'20px'}}>{this.state.uploadingRemarks}</Typography>
                            <CircularProgress />
                        </div>
                }
                {this.state.allDone && <Button onClick={(e:React.MouseEvent<HTMLElement>) => this.onHeaderClick('NAVIGATE','/dashboard')} color="primary" 
                    variant="contained">Go to Dashboard </Button>
                }

                <CardAssessemtSync ref={this.cardSync} onUpdate={this.onUploadStatus}/>
                
            </div>
        );
    }
}


export default withRouter(AssessmentSync);
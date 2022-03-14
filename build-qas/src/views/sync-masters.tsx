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
import { IAssessmentLocation, IAssessmentModule, IAssessmentModuleProcess, IJoint, ILeak, IWall, IWindow } from '../models/assessement';
import { IProject } from '../models/project';
import { checkOnline, downloadJointMaster, downloadLeakMaster, downloadLocationMaster, downloadModuleMaster, downloadModuleProcessMaster, 
    downloadWallMaster, downloadWindowMaster} from '../utilities/master-functions';
import { downloadProjectList } from '../utilities/project-functions';

type TParams = { projectId: string,module: string };
interface IState {
    status:string[];
    allDone:boolean;
}
class SyncMaster extends Component<RouteComponentProps<TParams>,IState > {
 
    constructor(props:RouteComponentProps<TParams> )
    {
        super(props)
        this.state = {
            status:[],
            allDone:false
        }
        this.onUpdateStatus = this.onUpdateStatus.bind(this);
        this.onModuleMasterLoad = this.onModuleMasterLoad.bind(this);
        this.onLocationMasterLoad = this.onLocationMasterLoad.bind(this);
        this.onProcessMasterLoad = this.onProcessMasterLoad.bind(this);
        this.onJointMasterLoad = this.onJointMasterLoad.bind(this);
        this.onLeakMasterLoad = this.onLeakMasterLoad.bind(this);
        this.onWallMasterLoad = this.onWallMasterLoad.bind(this);
        this.onWindowMasterLoad = this.onWindowMasterLoad.bind(this);
        this.onAssessmentLoad = this.onAssessmentLoad.bind(this);
        
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
        downloadModuleMaster(this.onModuleMasterLoad)
    }
    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='JUMP')
            this.props.history.push('/dashboard');    
      
    }
    onUpdateStatus(processStatus:string)
    {   
        if(processStatus ==='Download-Location-Master')
            downloadLocationMaster(this.onLocationMasterLoad);
        else if(processStatus ==='Download-Process-Master')
            downloadModuleProcessMaster(this.onProcessMasterLoad);            
        else if(processStatus ==='Download-Joint-Master')
            downloadJointMaster(this.onJointMasterLoad); 
        else if(processStatus ==='Download-Joint-Master')
            downloadJointMaster(this.onJointMasterLoad); 
        else if(processStatus ==='Download-Leak-Master')
            downloadLeakMaster(this.onLeakMasterLoad); 
        else if(processStatus ==='Download-Wall-Master')
            downloadWallMaster(this.onWallMasterLoad); 
        else if(processStatus ==='Download-Window-Master')
            downloadWindowMaster(this.onWindowMasterLoad); 
        else if(processStatus ==='Download-Assessment-Master')
            downloadProjectList(this.onAssessmentLoad); 
          
        else if(processStatus ==='Download-Completed')
            {
                this.setState({allDone:true});
                this.onUpdateStatus ('Process completed')   ;
            }             
        else
        {
            let currentStatus = this.state.status;
            currentStatus.push(processStatus);
            this.setState({status:currentStatus})
        }    
    }
    onModuleMasterLoad(master:IAssessmentModule[]|string)
    {
        if(Array.isArray(master))
        {
            this.onUpdateStatus('Module Master Dowloaded')
        }
        else
            this.onUpdateStatus(master as string)
        
        this.onUpdateStatus('Download-Location-Master')
    }
    onLocationMasterLoad(master:IAssessmentLocation[]|string)
    {
        if(Array.isArray(master))
        {
            this.onUpdateStatus('Location Master Dowloaded')
        }
        else
            this.onUpdateStatus(master as string)
        
        this.onUpdateStatus('Download-Process-Master')
    }
    onProcessMasterLoad(master:IAssessmentModuleProcess[]|string)
    {
        if(Array.isArray(master))
        {
            this.onUpdateStatus('Process Master Dowloaded')
        }
        else
            this.onUpdateStatus(master as string)
        
        this.onUpdateStatus('Download-Joint-Master')
    }
    
    onJointMasterLoad(master:IJoint[]|string)
    {
        if(Array.isArray(master))
        {
            this.onUpdateStatus('Joint Master Dowloaded')
        }
        else
            this.onUpdateStatus(master as string)
        
        this.onUpdateStatus('Download-Leak-Master')
        
    }
    
    onLeakMasterLoad(master:ILeak[]|string)
    {
        if(Array.isArray(master))
        {
            this.onUpdateStatus('Leak Master Dowloaded')
        }
        else
            this.onUpdateStatus(master as string)
        
        this.onUpdateStatus('Download-Wall-Master')
        
    }

    onWallMasterLoad(master:IWall[]|string)
    {
        if(Array.isArray(master))
        {
            this.onUpdateStatus('Wall Master Dowloaded')
        }
        else
            this.onUpdateStatus(master as string)
        
        this.onUpdateStatus('Download-Window-Master')
        
    }

    onWindowMasterLoad(master:IWindow[]|string)
    {
        if(Array.isArray(master))
        {
            this.onUpdateStatus('Window Master Dowloaded')
        }
        else
            this.onUpdateStatus(master as string)
        
        this.onUpdateStatus('Download-Assessment-Master')
        
    }

    onAssessmentLoad(master:IProject[]|string)
    {
        if(Array.isArray(master))
        {
            this.onUpdateStatus('Assessment Dowloaded')
        }
        else
            this.onUpdateStatus(master as string)
        
        this.onUpdateStatus('Download-Completed') 
        
        
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
                        <Typography variant="h6">Sync Masters </Typography>
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
                    variant="contained">Go to Dashboard </Button>
                }
            </div>
        );
    }
}
export default withRouter(SyncMaster);
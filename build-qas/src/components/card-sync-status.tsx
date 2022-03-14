import React, { Component } from 'react'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import { getSyncDetails, getSyncUploadDetails, ISyncDetails, ISyncUploadDetails } from '../utilities/master-functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Grid } from '@material-ui/core';
import { Toolbar } from '@material-ui/core';


interface ISyncStatus {
    name:string,
    icon:any,
    link:string,
    note:string
}


interface IProps {
    
    onHeaderClick:(action:string, path:string)=>void
}
type TParams = { masterId: string };
interface IState {
    syncDownloadStatus:ISyncStatus[],
    syncPendingStatus:ISyncStatus[],
}

class CardSyncStatus extends Component<IProps,IState> {

    state:IState;

    constructor(props:IProps)
    {
        super(props)
        this.state={
            syncDownloadStatus: [],
            syncPendingStatus: []
        }

        this.onSyncDetails = this.onSyncDetails.bind(this);
        this.onSyncUploadDetails = this.onSyncUploadDetails.bind(this);
        this.onInit = this.onInit.bind(this);
        

    }
    componentDidMount()
    {
        this.onInit()
    }
    componentDidUpdate () {
        this.onInit();
     }

    onInit()
    {
        getSyncDetails(this.onSyncDetails);
        getSyncUploadDetails(this.onSyncUploadDetails)
    }
    onSyncDetails(details:ISyncDetails)
    {
        let status:ISyncStatus[]=[];
        status.push({name:'Modules',link:'/masters/modules',icon:'layer-group', note:'Last updated on: ' +details.modulesDateTime})
        status.push({name:'Location',link:'/masters/location',icon:'location-arrow',note:'Last updated on: ' +details.locationDateTime})
        status.push({name:'Process',link:'/masters/process',icon:'search',note:'Last updated on: ' +details.processDateTime})
        status.push({name:'Joint',link:'/masters/joint',icon:'crop-alt',note:'Last updated on: ' +details.jointDateTime})
        status.push({name:'Leak',link:'/masters/leak',icon:'braille',note:'Last updated on: ' +details.leakDateTime})
        status.push({name:'Wall',link:'/masters/wall',icon:'align-justify',note:'Last updated on: ' +details.wallDateTime})
        status.push({name:'Window',link:'/masters/window',icon:'border-all',note:'Last updated on: ' +details.windowDateTime})

        status.push({name:'Assessment',link:'/assessment-listing',icon:'balance-scale',note:'Last updated on: ' +details.assessmentDateTime})
        this.setState({syncDownloadStatus:status});
    }
    onSyncUploadDetails(details:ISyncUploadDetails[])
    {
        let status:ISyncStatus[]=[];
        details.forEach((detail:ISyncUploadDetails)=>{
            if(detail.module==='Internal Finishes')
                status.push({name: detail.name,link:'/assessment-sync/internal-finishes/'+detail.projectId,icon:'balance-scale', note: detail.module + ' from '+ detail.firstDateTime +' till ' +detail.lastDateTime});
            else if(detail.module==='External Wall')
                status.push({name: detail.name,link:'/assessment-sync/external-wall/'+detail.projectId,icon:'balance-scale', note: detail.module + ' from '+ detail.firstDateTime +' till ' +detail.lastDateTime});
            else if(detail.module==='External Work')
                status.push({name: detail.name,link:'/assessment-sync/external-work/'+detail.projectId,icon:'balance-scale', note: detail.module + ' from '+ detail.firstDateTime +' till ' +detail.lastDateTime});
            else if(detail.module==='Roof Construction')
                status.push({name: detail.name,link:'/assessment-sync/roof-construction/'+detail.projectId,icon:'balance-scale', note: detail.module + ' from '+ detail.firstDateTime +' till ' +detail.lastDateTime});
            else if(detail.module==='Field Window')
                status.push({name: detail.name,link:'/assessment-sync/field-window/'+detail.projectId,icon:'balance-scale', note: detail.module + ' from '+ detail.firstDateTime +' till ' +detail.lastDateTime});
            else if(detail.module==='Wet Area')
                status.push({name: detail.name,link:'/assessment-sync/wet-area/'+detail.projectId,icon:'balance-scale', note: detail.module + ' from '+ detail.firstDateTime +' till ' +detail.lastDateTime});
            else
                status.push({name: detail.name,link:'/assessment-sync/internal-finishes/'+detail.projectId,icon:'balance-scale', note: detail.module + ' from '+ detail.firstDateTime +' till ' +detail.lastDateTime});
        });
        this.setState({syncPendingStatus:status});
    }
    onHeaderClick(action:string, path:string){
        this.props.onHeaderClick(action,path)
    }
    render() {
        return (
            <>
            <Toolbar style={{paddingRight:'0px',marginTop:'10px', backgroundColor:'#faf0f0',color:'#2c61a7'}}  >
                            <Typography variant="h6">Sync Status</Typography>
                            <Typography variant="h6" style={{flexGrow: 1,textAlign:'center'}}></Typography>
                            <ButtonGroup size="small" aria-label="small outlined button group" style={{backgroundColor:'#2c61a7',height:'40px',marginRight:'10px'}}>
                                <Button style={{color:'white',minWidth:'34px',maxWidth:'34px'}} onClick={(e)=>this.onHeaderClick('NAVIGATE','/sync-masters')}><FontAwesomeIcon icon="sync"  style={{color:'white',fontSize:'20px'}}/></Button>
                            </ButtonGroup>
                        </Toolbar>
            <Paper className="db-card-panel" elevation={0}>
                
                <Grid container spacing={2} >
                    <Grid item xs={12}>
                        
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper>
                        <div style={{textAlign:'center'}}>Masters Downloads</div>
                        <div className="div-auto" style={{width:'100%',maxHeight: '170px',minHeight: '170px'}}>
                            <List style={{margin:'10px'}}>
                                {
                                    this.state.syncDownloadStatus.map ((status:ISyncStatus,index:number)=>
                                        <ListItem key={index}>
                                            <IconButton edge="start" aria-label="go"  onClick={(e)=>this.onHeaderClick('NAVIGATE',status.link)}>
                                            <FontAwesomeIcon icon={status.icon} style={{color:'#2c61a7',fontSize:'30px'}}/>
                                                </IconButton>
                                            <ListItemText primary={status.name} secondary={status.note} onClick={(e)=>this.onHeaderClick('NAVIGATE',status.link)}/>
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" aria-label="go"  onClick={(e)=>this.onHeaderClick('NAVIGATE',status.link)}>
                                                <FontAwesomeIcon icon="angle-right" style={{color:'#2c61a7',fontSize:'30px'}}/>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                }
                            </List>
                        </div>

                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper>
                        <div style={{textAlign:'center'}}>Pending upload</div>
                        <div className="div-auto" style={{width:'100%',maxHeight: '170px',minHeight: '170px'}}>
                            <List style={{margin:'10px'}}>
                                {
                                    this.state.syncPendingStatus.map ((status:ISyncStatus,index:number)=>
                                        <ListItem key={index}>
                                            <IconButton edge="start" aria-label="go" onClick={(e)=>this.onHeaderClick('NAVIGATE',status.link)}>
                                            <FontAwesomeIcon icon={status.icon} style={{color:'#2c61a7',fontSize:'30px'}}/>
                                                </IconButton>
                                            <ListItemText primary={status.name} secondary={status.note}/>
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" aria-label="go"  onClick={(e)=>this.onHeaderClick('NAVIGATE',status.link)}>
                                                <FontAwesomeIcon icon="angle-right" style={{color:'#2c61a7',fontSize:'30px'}}/>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                }
                            </List>
                        </div>

                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
            </>
        )
    }

}

export default CardSyncStatus ;
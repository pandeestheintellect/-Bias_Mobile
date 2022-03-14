import React, { Component } from 'react';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import Button from '@material-ui/core/Button';
import {DialogTitle, DialogTransition} from './dialog-title'
import { LinearProgress, Typography } from '@material-ui/core';
import { AssessmentTypes } from '../../utilities/assessment-functions';
import { downloadExternalWall } from '../../utilities/external-wall-functions';
import { downloadInternalFinishes } from '../../utilities/internal-finishes-functions';
import { downloadExternalWork } from '../../utilities/external-work-functions';
import { downloadRoofConstruction } from '../../utilities/roof-construction-functions';
import { downloadFieldWindow } from '../../utilities/field-window-functions';
import { downloadWetArea } from '../../utilities/wet-area-functions';
import { IWall, IWindow, IJoint, ILeak, IDirection } from '../../models/assessement';
import { getWindowMaster, getJointMaster, getLeakMaster, getDirectionMaster, getWallMaster } from '../../utilities/master-functions';
import { downloadProjectSummary } from '../../utilities/project-functions';

interface IProps {
    
    onDownloadCompleted:(status: boolean,message:string)=>void;
}

interface IState {
    addDialogOpen:boolean;
    hasError:boolean;
    remarks:string;
    nextDownload:number;
    projectId:number;
}

class DialogDownloadAssessment extends Component<IProps,{}> {
    state: IState;
    walls:IWall[];
    windows:IWindow[];
    joints:IJoint[];
    leaks:ILeak[];
    directions:IDirection[];

    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            
            addDialogOpen:false,
            hasError:false,
            remarks:'',    
            nextDownload:AssessmentTypes.ExternalWall  ,
            projectId:0
            }
        
        this.walls=[];
        this.windows=[];
        this.leaks=[];
        this.joints=[];
        this.directions=[];
    
        this.onWallMasterLoad = this.onWallMasterLoad.bind(this);
        this.onWindowMasterLoad = this.onWindowMasterLoad.bind(this);
        this.onJointMasterLoad = this.onJointMasterLoad.bind(this);
        this.onLeakMasterLoad = this.onLeakMasterLoad.bind(this);
        this.onDirectionMasterLoad = this.onDirectionMasterLoad.bind(this);

        this.ondownloadStatus =this.ondownloadStatus.bind(this);
        this.onDownloadCompleted = this.onDownloadCompleted.bind(this);
    }
    onDialogOpen = (idReference:number) => {
        this.setState({addDialogOpen:true,projectId:idReference, remarks:'Internal Finishes'});
        downloadInternalFinishes(idReference,this.ondownloadStatus)
    }
    onDialogClose = () => {
        this.setState({addDialogOpen:false});
    }
    
    onWallMasterLoad(wallMaster:IWall[]|string)
    {
        if(Array.isArray(wallMaster))
        {
            this.walls=wallMaster as IWall[];;
        }
            
        getWindowMaster(this.onWindowMasterLoad);
        
    }
    onWindowMasterLoad(windowMaster:IWindow[]|string)
    {
        
        if(Array.isArray(windowMaster))
        {
            this.windows=windowMaster as IWindow[];
        }
            
        getJointMaster(this.onJointMasterLoad);

    }
    onJointMasterLoad(jointMaster:IJoint[]|string)
    {
        if(Array.isArray(jointMaster))
        {
            this.joints=jointMaster as IJoint[];
            
        }
        getLeakMaster(this.onLeakMasterLoad);

    }
    onLeakMasterLoad(leakMaster:ILeak[]|string)
    {
        
        if(Array.isArray(leakMaster))
        {
            this.leaks=leakMaster as ILeak[];
        }
        getDirectionMaster(this.onDirectionMasterLoad);

    }
    onDirectionMasterLoad(directionMaster:IDirection[])
    {
        this.directions=directionMaster;

        downloadFieldWindow(this.state.projectId,this.walls,this.windows,this.joints,this.leaks,this.directions,this.ondownloadStatus)
    }

    ondownloadStatus(status:string)
    {
        if(status==='Process completed')
        {
            if(this.state.nextDownload===AssessmentTypes.ExternalWall)
            {
                this.setState({nextDownload:AssessmentTypes.ExternalWork, remarks:'External Wall'})
                downloadExternalWall(this.state.projectId,this.ondownloadStatus)
            }
            else if(this.state.nextDownload===AssessmentTypes.ExternalWork)
            {
                this.setState({nextDownload:AssessmentTypes.RoofConsctruction, remarks:'External Work'})
                downloadExternalWork(this.state.projectId,this.ondownloadStatus)
            }
            else if(this.state.nextDownload===AssessmentTypes.RoofConsctruction)
            {
                this.setState({nextDownload:AssessmentTypes.FieldWindow, remarks:'Roof constructions'})
                downloadRoofConstruction(this.state.projectId,this.ondownloadStatus)
            }
            else if(this.state.nextDownload===AssessmentTypes.FieldWindow)
            {
                this.setState({nextDownload:AssessmentTypes.WetArea, remarks:'Field Windows'})
                getWallMaster(this.onWallMasterLoad);
            }
            else if(this.state.nextDownload===AssessmentTypes.WetArea)
            {
                this.setState({nextDownload:100, remarks:'Wet areas'})
                downloadWetArea(this.state.projectId,this.ondownloadStatus)
            }
            else if(this.state.nextDownload===100)
            {
                this.setState({nextDownload:-1, remarks:'Summary'})
                downloadProjectSummary(this.state.projectId,this.ondownloadStatus)
            }
            else
                this.onDownloadCompleted();

        }
    }
    onDownloadCompleted()
    {
        this.onDialogClose();
    }
    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick
            TransitionComponent={DialogTransition}  aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Downloading assessements</DialogTitle>
                <DialogContent>
                    <LinearProgress style={{width:'500px'}}/>
                    <Typography variant="h6" style={{marginBottom:'20px',marginTop:'20px'}}>{this.state.remarks}</Typography>
                </DialogContent>
                {this.state.hasError && <DialogActions>
                <Button onClick={this.onDownloadCompleted} style={{color:'white',backgroundColor:'#2c61a7'} } 
                    variant="contained">Okay </Button>
                
                </DialogActions>}
            </Dialog>
                   
        )
    }
}

export default DialogDownloadAssessment;
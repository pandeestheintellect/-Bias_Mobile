import React, { Component } from 'react';

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import {DialogTitle, DialogTransition} from './dialog-title'
import SignatureCanvas from 'react-signature-canvas'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TextField from '@material-ui/core/TextField';
import { KeyboardDatePicker,MuiPickersUtilsProvider  } from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
import moment from "moment";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { IDirection, IJoint, ILeak, IWall, IWindow } from '../../models/assessement';
import { IFieldWindow } from '../../utilities/field-window-functions';
import { AssessmentTypes } from '../../utilities/assessment-functions';
import { getBlockDetail, updateBlockDetails } from '../../utilities/master-functions';


interface IProps {
    
   onCreate:(processData:IFieldWindow)=>void;
}

interface IState {
    errorText:string,
    addDialogOpen:boolean,
    walls:IWall[],
    wallId:number,
    windows:IWindow[],
    windowId:number,
    joints:IJoint[],
    jointId:number,
    leaks:ILeak[],
    leakId:number,
    directions:IDirection[],
    directionId:number,
    block:string,
    selectedDate:any
}

class DialogAddFieldWindow extends Component<IProps,{}> {
    state: IState;
    signatureCanvas = React.createRef<SignatureCanvas>();
    
    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            errorText:'',
            block:'',
            walls:[],
            windows:[],
            joints:[],
            leaks:[],
            directions:[],
            wallId:0,
            windowId:0,
            jointId:0,
            leakId:0,
            directionId:2,
            addDialogOpen:false,
            selectedDate:moment().toDate()
            }

        this.onLoadBlockDetail = this.onLoadBlockDetail.bind(this)   
    }
    componentDidMount()
    {
        getBlockDetail(AssessmentTypes.FieldWindow,this.onLoadBlockDetail)
    }
    onLoadBlockDetail(lastBlock:string)
    {
        this.setState({block:lastBlock})
    }
    
    onDialogOpen = ( wall:IWall[],window:IWindow[],joint:IJoint[],leak:ILeak[],direction:IDirection[]) => {
     
        if(Array.isArray(wall))
            this.setState({wallId:wall[0].id});
        
        if(Array.isArray(window))
            this.setState({windowId:window[0].id});
        if(Array.isArray(joint))
            this.setState({jointId:joint[0].id});
        if(Array.isArray(leak))
            this.setState({leakId:leak[0].id});

        this.setState({addDialogOpen:true,id:1,walls:wall,windows:window,joints:joint,leaks:leak,directions:direction});
    }
    onDialogClose = () => {
        this.setState({addDialogOpen:false});
    }
    
    handleDateChange = (date:MaterialUiPickersDate) => {
        this.setState({selectedDate:date })
    }
    handleLocationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
            this.setState({location:event.target.value})
    };
    onCreate=()=>
    {
        if (this.state.block.trim().length===0)
        {
            this.setState({errorText:'Please enter block details'})
            return;
        }
        let processData:IFieldWindow={
            id: 0,
            date:moment(this.state.selectedDate).format('DD/MM/YYYY'),
            block:this.state.block,
            wallId:this.state.wallId,
            wallName:this.state.walls.filter(e=>e.id===this.state.wallId)[0].name,
            windowId:this.state.windowId,
            windowName:this.state.windows.filter(e=>e.id===this.state.windowId)[0].name,
            jointId:this.state.jointId,
            jointName:this.state.joints.filter(e=>e.id===this.state.jointId)[0].name,
            directionId:this.state.directionId,
            directionName:this.state.directions.filter(e=>e.id===this.state.directionId)[0].name,
            leakId:this.state.leakId,
            leakName:this.state.leaks.filter(e=>e.id===this.state.leakId)[0].name,
            result:1,
            status:1,
            drawing:''
        }
        updateBlockDetails(AssessmentTypes.FieldWindow,this.state.block);
        this.props.onCreate(processData);
        this.onDialogClose();
    }

    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick 
            TransitionComponent={DialogTransition} aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Add Field Window</DialogTitle>
                <DialogContent>
 
                <TextField style={{width:'300px',marginBottom:'10px'}}
                    autoFocus
                    margin="dense" 
                    id="name" 
                    value={this.state.block}
                    onChange={(e)=>{this.setState({block:e.target.value,errorText:''})}}
                    label="Block / Unit"
                /><br/>
                <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
                <KeyboardDatePicker style={{width:'300px',marginBottom:'10px'}} size="small"
                    autoOk
                    variant="inline"
                    label="Assessment Date"
                    format="DD/MM/YYYY"
                    value={this.state.selectedDate}
                    InputAdornmentProps={{ position: "start" }}
                    keyboardIcon={<FontAwesomeIcon icon="calendar-alt" style={{fontSize:'20px'}}/>}
                    onChange={(date:MaterialUiPickersDate) => this.handleDateChange(date)}
                />
                </MuiPickersUtilsProvider> <br/> 

                <FormControl size="small">
                    <InputLabel id="field-window-wall-outlined-label">Wall</InputLabel>
                    <Select style={{width:'300px',marginBottom:'10px'}}
                    labelId="field-window-wall-outlined-label"
                    id="field-window-wall"
                    value={this.state.wallId}
                    onChange={(e)=>this.setState({wallId:e.target.value})}
                    label="Wall"
                    >
                    {
                        this.state.walls.map((wall:IWall,index:number)=>
                            <MenuItem key={index} value={wall.id}>{wall.name} </MenuItem>
                        )
                    }
                    </Select>
                </FormControl><br/> 
                <FormControl size="small">
                    <InputLabel id="field-window-window-outlined-label">Window</InputLabel>
                    <Select style={{width:'300px',marginBottom:'10px'}}
                    labelId="field-window-window-outlined-label"
                    id="field-window-window"
                    value={this.state.windowId}
                    onChange={(e)=>this.setState({windowId:e.target.value})}
                    label="Window"
                    >
                    {
                        this.state.windows.map((window:IWindow,index:number)=>
                            <MenuItem key={index} value={window.id}>{window.name} </MenuItem>
                        )
                    }
                    </Select>
                </FormControl><br/> 
                <FormControl size="small">
                    <InputLabel id="field-window-joint-outlined-label">Joint</InputLabel>
                    <Select style={{width:'300px',marginBottom:'10px'}}
                    labelId="field-window-joint-outlined-label"
                    id="field-window-joint"
                    value={this.state.jointId}
                    onChange={(e)=>this.setState({jointId:e.target.value})}
                    label="Joint"
                    >
                    {
                        this.state.joints.map((joint:IJoint,index:number)=>
                            <MenuItem key={index} value={joint.id}>{joint.name} </MenuItem>
                        )
                    }
                    </Select>
                </FormControl><br/> 
                <FormControl size="small">
                    <InputLabel id="field-window-direction-outlined-label">Direction</InputLabel>
                    <Select style={{width:'300px',marginBottom:'10px'}}
                    labelId="field-window-direction-outlined-label"
                    id="field-window-direction"
                    value={this.state.directionId}
                    onChange={(e)=>this.setState({directionId:e.target.value})}
                    label="direction"
                    >
                    {
                        this.state.directions.map((direction:IDirection,index:number)=>
                            <MenuItem key={index} value={direction.id}>{direction.name} </MenuItem>
                        )
                    }
                    </Select>
                </FormControl><br/> 
                <FormControl size="small">
                    <InputLabel id="field-window-leak-outlined-label">Leak Thru</InputLabel>
                    <Select style={{width:'300px',marginBottom:'10px'}}
                    labelId="field-window-leak-outlined-label"
                    id="field-window-leak"
                    value={this.state.leakId}
                    onChange={(e)=>this.setState({leakId:e.target.value})}
                    label="Leak"
                    >
                    {
                        this.state.leaks.map((leak:ILeak,index:number)=>
                            <MenuItem key={index} value={leak.id}>{leak.name} </MenuItem>
                        )
                    }
                    </Select>
                </FormControl>
                <div style={{color:'red'}}>{this.state.errorText}</div>
                </DialogContent>
                <DialogActions>
                <Button onClick={this.onCreate} color="primary" 
                    variant="contained">Create <FontAwesomeIcon icon="check"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                
                </DialogActions>
            </Dialog>
                   
        )
    }
}

export default DialogAddFieldWindow;
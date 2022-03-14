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
import { IModuleProcess } from '../../models/assessement';
import { AssessmentTypes } from '../../utilities/assessment-functions';
import { getBlockDetail, updateBlockDetails } from '../../utilities/master-functions';

interface IProps {
    
    onCreate:(block:string,date:string,locationId:number,location:string)=>void;
}

interface IState {
    errorText:string,
    addDialogOpen:boolean,
    locations:IModuleProcess[],
    block:string,
    selectedDate:any,
    location:number
}

class DialogAddExternalWork extends Component<IProps,{}> {
    state: IState;
    signatureCanvas = React.createRef<SignatureCanvas>();
    
    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            errorText:'',
            block:'',
            locations:[],
            addDialogOpen:false,
            selectedDate:moment().toDate(),
            location:0
            }
        
        this.onLoadBlockDetail = this.onLoadBlockDetail.bind(this)   
    }
    componentDidMount()
    {
        getBlockDetail(AssessmentTypes.ExternalWork,this.onLoadBlockDetail)
    }
    onLoadBlockDetail(lastBlock:string)
    {
        this.setState({block:lastBlock})
    }
    
    onDialogOpen = (locationList:IModuleProcess[]) => {

        let firstLocation=0;
        if(locationList.length>0)
            firstLocation=locationList[0].id;

        this.setState({addDialogOpen:true,id:1,location:firstLocation,
            locations:locationList});
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
        let locationText='';
        let locations = this.state.locations;
        for (let i=0;i<locations.length;i++)
        {
            if (this.state.location===locations[i].id)
            {
                locationText=locations[i].name;
                break;
            }
        }
        updateBlockDetails(AssessmentTypes.ExternalWork,this.state.block);
        this.props.onCreate(this.state.block,moment(this.state.selectedDate).format('DD/MM/YYYY') ,this.state.location,locationText);
        this.onDialogClose();
    }

    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick 
            TransitionComponent={DialogTransition} aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Add External Work</DialogTitle>
                <DialogContent>
 
                <TextField style={{width:'300px',marginBottom:'10px'}}
                    autoFocus
                    margin="dense" 
                    id="name" 
                    value={this.state.block}
                    onChange={(e)=>{this.setState({block:e.target.value,errorText:''})}}
                    label="Remarks"
                    rows={4}
                    multiline
                /><br/>
                <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
                <KeyboardDatePicker style={{width:'300px',marginBottom:'10px'}}
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
                <FormControl >
                    <InputLabel id="external-work-location-outlined-label">Location</InputLabel>
                    <Select style={{width:'300px'}}
                    labelId="external-work-location-outlined-label"
                    id="external-work-location"
                    value={this.state.location}
                    onChange={this.handleLocationChange}
                    label="Location"
                    >
                    {
                        this.state.locations.map((location:IModuleProcess,index:number)=>
                            <MenuItem key={index} value={location.id}>{location.name} </MenuItem>
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

export default DialogAddExternalWork;
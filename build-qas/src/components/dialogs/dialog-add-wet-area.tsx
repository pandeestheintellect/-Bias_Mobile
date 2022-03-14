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
import { AssessmentTypes } from '../../utilities/assessment-functions';
import { getBlockDetail, updateBlockDetails } from '../../utilities/master-functions';



interface IProps {
    
    onCreate:(block:string,date:string,others:string)=>void;
}

interface IState {
    errorText:string,
    addDialogOpen:boolean,
    block:string,
    selectedDate:any,
    others:string
}

class DialogAddWetArea extends Component<IProps,{}> {
    state: IState;
    signatureCanvas = React.createRef<SignatureCanvas>();
    
    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            errorText:'',
            block:'',
            others:'',
            addDialogOpen:false,
            selectedDate:moment().toDate()
            }

            this.onLoadBlockDetail = this.onLoadBlockDetail.bind(this)   
    }
    componentDidMount()
    {
        getBlockDetail(AssessmentTypes.WetArea,this.onLoadBlockDetail)
    }
    onLoadBlockDetail(lastBlock:string)
    {
        this.setState({block:lastBlock})
    }
    
    onDialogOpen = () => {

        this.setState({addDialogOpen:true});
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
        updateBlockDetails(AssessmentTypes.WetArea,this.state.block);
        this.props.onCreate(this.state.block,moment(this.state.selectedDate).format('DD/MM/YYYY'),this.state.others);
        this.onDialogClose();
    }

    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick 
                aria-labelledby="form-dialog-title" TransitionComponent={DialogTransition}>
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Add Wet Area</DialogTitle>
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


  
export default DialogAddWetArea;
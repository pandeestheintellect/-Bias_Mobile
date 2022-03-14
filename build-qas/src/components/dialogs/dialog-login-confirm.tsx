import React, { Component } from 'react';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import Button from '@material-ui/core/Button';
import {DialogTitle, DialogTransition} from './dialog-title'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
    onSubmission:()=>void;
}

interface IState {
    addDialogOpen:boolean;
    message:string;
}

class DialogLoginConfirm extends Component<IProps,{}> {
    state: IState;

    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            addDialogOpen:false,
            message:''
            }
    }
    onDialogOpen = (info:string) => {
        this.setState({addDialogOpen:true,message:info});
    }
    onDialogClose = () => {
        this.setState({addDialogOpen:false});
    }
    
    onSubmission=()=>
    {
        this.onDialogClose();
        this.props.onSubmission();
        
    }
    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick
            TransitionComponent={DialogTransition}  aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Confirm ?</DialogTitle>
                <DialogContent>
                    {this.state.message}
                </DialogContent>
                <DialogActions>
                <Button onClick={this.onSubmission} color='primary' 
                    variant="contained">Okay <FontAwesomeIcon icon="check-double"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                <Button onClick={this.onDialogClose} style={{color:'white',backgroundColor:'#F16876'} } 
                    variant="contained">Cancel <FontAwesomeIcon icon="ban"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                </DialogActions>
            </Dialog>
                   
        )
    }
}

export default DialogLoginConfirm;
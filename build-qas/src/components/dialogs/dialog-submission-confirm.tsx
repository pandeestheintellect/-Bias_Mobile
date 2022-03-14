import React, { Component } from 'react';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import Button from '@material-ui/core/Button';
import {DialogTitle, DialogTransition} from './dialog-title'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateProject } from '../../utilities/project-functions';

interface IProps {
    onSubmission:(status:string)=>void;
}

interface IState {
    addDialogOpen:boolean,
    id:number
}

class DialogSubmissionConfirm extends Component<IProps,{}> {
    state: IState;

    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            
            addDialogOpen:false,
            id:0      
            }
        this.onSubmitted = this.onSubmitted.bind(this)
    }
    onDialogOpen = (idReference:number) => {
        this.setState({addDialogOpen:true,id:idReference});
    }
    onDialogClose = () => {
        this.setState({addDialogOpen:false});
    }
    
    onSubmission=()=>
    {
        updateProject(this.state.id,this.onSubmitted)
        
    }
    onSubmitted(status:string)
    {
        this.onDialogClose();
        this.props.onSubmission(status);
    }
    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick
            TransitionComponent={DialogTransition}  aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Confirm Submission?</DialogTitle>
                <DialogContent>
                    Click Okay to continue - No further changes will be allowed.
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

export default DialogSubmissionConfirm;
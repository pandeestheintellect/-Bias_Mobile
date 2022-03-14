import React, { Component } from 'react';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import Button from '@material-ui/core/Button';
import {DialogTitle, DialogTransition} from './dialog-title'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { doLogOut, updateConnectionStatus } from '../../utilities/user-functions';
import { RouteComponentProps } from 'react-router-dom';

interface IProps {
    onSubmission:()=>void;
    navigator: RouteComponentProps;
}

interface IState {
    addDialogOpen:boolean;
    message:string;
}

class DialogLogOut extends Component<IProps,{}> {
    state: IState;

    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            addDialogOpen:false,
            message:''
            }
            this.onLogoutComplete =this.onLogoutComplete.bind(this)
    }
    onDialogOpen = (info:string) => {
        this.setState({addDialogOpen:true,message:info});
    }
    onDialogClose = () => {
        this.setState({addDialogOpen:false});
    }
    
    onSubmission=()=>
    {
        doLogOut(this.onLogoutComplete)
        
    }
    onLogoutComplete(status:string)
    {
        this.onDialogClose();
        this.props.onSubmission();

    }
    
    onContinue=()=>
    {
        updateConnectionStatus(true);
        this.props.navigator.history.push('/login'); 
        this.onDialogClose();
    }
  
    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick
            TransitionComponent={DialogTransition}  aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Confirm Logout?</DialogTitle>
                <DialogContent>
                    {this.state.message}
                </DialogContent>
                <DialogActions>
                <Button onClick={this.onContinue} style={{color:'white',backgroundColor:'#009688'} } 
                    variant="contained">Work offline <FontAwesomeIcon icon="retweet"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                <Button onClick={this.onSubmission} color='primary' 
                    variant="contained">Okay <FontAwesomeIcon icon="check-double"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                <Button onClick={this.onDialogClose} style={{color:'white',backgroundColor:'#F16876'} } 
                    variant="contained">Cancel <FontAwesomeIcon icon="ban"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                </DialogActions>
            </Dialog>
                   
        )
    }
}

export default DialogLogOut;
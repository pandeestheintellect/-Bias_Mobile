import React, { Component } from 'react';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import Button from '@material-ui/core/Button';
import {DialogTitle, DialogTransition} from './dialog-title'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RouteComponentProps } from 'react-router-dom';
import { updateConnectionStatus } from '../../utilities/user-functions';

interface IProps {
    navigator: RouteComponentProps;
    
}

interface IState {
    addDialogOpen:boolean;
    message:string;
}

class DialogReLogin extends Component<IProps,{}> {
    state: IState;

    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            addDialogOpen:false,
            message:''
            }
    }
    onDialogOpen = () => {
        this.setState({addDialogOpen:true});
    }
    onDialogClose = () => {
        this.setState({addDialogOpen:false});
    }
    
    onRelogin=()=>
    {
        
        this.props.navigator.history.push('/login');
        this.onDialogClose();
    }

    onContinue=()=>
    {
        updateConnectionStatus(true);
        this.props.navigator.history.push('/dashboard');
        this.onDialogClose();
    }

    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick
            TransitionComponent={DialogTransition}  aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Unauthorized access or Session time out</DialogTitle>
                <DialogContent>
                    Your session timed out or You logged in from another device,
                </DialogContent>
                <DialogActions>
                <Button onClick={this.onRelogin} color='primary' 
                    variant="contained">Relogin <FontAwesomeIcon icon="sign-in-alt"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                <Button onClick={this.onContinue} style={{color:'white',backgroundColor:'#009688'} } 
                    variant="contained">Continue in offline <FontAwesomeIcon icon="retweet"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                </DialogActions>
            </Dialog>
                   
        )
    }
}

export default DialogReLogin;
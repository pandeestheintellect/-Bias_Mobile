import React, { Component } from 'react';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import Button from '@material-ui/core/Button';
import {DialogTitle, DialogTransition} from './dialog-title'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
    onDelete:(id: number)=>void;
}

interface IState {
    addDialogOpen:boolean,
    id:number
}

class DialogDeleteConfirm extends Component<IProps,{}> {
    state: IState;

    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            
            addDialogOpen:false,
            id:0      
            }
    }
    onDialogOpen = (idReference:number) => {
        this.setState({addDialogOpen:true,id:idReference});
    }
    onDialogClose = () => {
        this.setState({addDialogOpen:false});
    }
    
    onDelete=()=>
    {
        this.props.onDelete(this.state.id);
        this.onDialogClose();
    }
    render()
    {
        return(
            
            <Dialog open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick
            TransitionComponent={DialogTransition}  aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Please confirm to remove</DialogTitle>
                <DialogContent>
                    Do you really wants to remove this item?
                </DialogContent>
                <DialogActions>
                <Button onClick={this.onDelete} style={{color:'white',backgroundColor:'#F16876'} } 
                    variant="contained">Yes <FontAwesomeIcon icon="trash-alt"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                
                </DialogActions>
            </Dialog>
                   
        )
    }
}

export default DialogDeleteConfirm;
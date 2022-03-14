import React, { Component } from 'react';

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import {DialogTitle, DialogTransition} from './dialog-title'
import ReactSignatureCanvas from 'react-signature-canvas'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ButtonGroup from '@material-ui/core/ButtonGroup';

interface IProps {
    onSign: (rowId:number,sign:string) =>void;
}

interface IState {
    dialogOpen:boolean;
    imageString:string;
    editMode:boolean;
    penColor:string;
    title:string;
    id:number;
    canEdit:boolean;
}

class DialogDrawing extends Component<IProps,IState> {

    signatureCanvas = React.createRef<ReactSignatureCanvas>();
    
    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            dialogOpen:false,
            editMode:false,
            imageString:'',
            penColor:'blue',
            title:'',
            id:0      ,
            canEdit:true
            }
        this.onDialogOpen = this.onDialogOpen.bind(this);
        this.onShowImage = this.onShowImage.bind(this);
        this.onRestore=this.onRestore.bind(this);
        this.onEdit=this.onEdit.bind(this)
    }
    onDialogOpen  (rowId:number,image:string,readOnly:boolean) {

        
        this.setState({dialogOpen:true,id:rowId,editMode:false,canEdit:readOnly});
        if (image && image.length>0)
            this.setState({imageString:image});
        else
            this.setState({imageString:''});

        setTimeout(() => {
            this.onShowImage();
            if(this.state.canEdit)
                this.onEdit();
        }, 60);

    }
    onShowImage()
    {
        if (this.state.imageString.length>10)
        {
            this.signatureCanvas.current?.fromDataURL(this.state.imageString,{width:500,height:500});
        }
        else
            this.signatureCanvas.current?.clear();
        this.signatureCanvas.current?.off();
    }
    onRestore()
    {
        this.signatureCanvas.current?.clear();
        if (this.state.imageString.length>10)
        {
            this.signatureCanvas.current?.fromDataURL(this.state.imageString);
         }
        this.setState({editMode:false,title:''})
        this.signatureCanvas.current?.off();
    }
    onDialogClose = () => {
        this.setState({dialogOpen:false});
    }
    onEdit=()=>{
        this.setState({editMode:true,title:' - drawing mode you can write now'})
        this.signatureCanvas.current?.on();
    }
    onErase=()=>
    {
        this.setState({penColor:'white',title:' - erase mode you can erase now'});
    } 
    onDraw=()=>
    {
        this.setState({title:' - drawing mode you can write now'})
        this.setState({penColor:'blue'});
    } 
    onClear=()=>
    {
        this.onDraw();
        this.signatureCanvas.current?.clear();
    }    
    onSign=()=>
    {
        let signature = this.signatureCanvas.current?.toDataURL('image/png');
        if (signature)
            this.props.onSign(this.state.id, signature as string);
        else
            this.props.onSign(this.state.id, '');

        this.onDialogClose();
    }
    onClose=()=>
    {
        this.onDialogClose();
    }
    render()
    {
        return(
            
            <Dialog open={this.state.dialogOpen} onClose={this.onDialogClose} disableBackdropClick 
            TransitionComponent={DialogTransition} aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>Draw notes {this.state.title}</DialogTitle>
                <DialogContent style={{border:'1px solid #000',padding:6}}>
                <ReactSignatureCanvas ref={this.signatureCanvas} penColor={this.state.penColor} canvasProps={{width: 500, height: 500, className: 'sigCanvas'}} />
                </DialogContent>
                {this.state.canEdit===true &&
                    <DialogActions>
                    {
                    this.state.editMode?
                            <ButtonGroup size="small" color="primary" aria-label="small outlined button group">
                                <Button onClick={this.onClear} color="primary"  
                                    variant="contained">Clear<FontAwesomeIcon icon="broom"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                                <Button onClick={this.onErase} color="primary"  
                                    variant="contained">Erase<FontAwesomeIcon icon="eraser"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                                <Button onClick={this.onDraw} color="primary"  
                                    variant="contained">Draw<FontAwesomeIcon icon="paint-brush"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                                <Button onClick={this.onSign} color="primary"  
                                    variant="contained">Save<FontAwesomeIcon icon="save"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                                <Button onClick={this.onRestore} color="primary"  
                                    variant="contained">Restore<FontAwesomeIcon icon="undo"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                            </ButtonGroup>
                        :
                        <ButtonGroup size="small" color="primary" aria-label="small outlined button group">
                            <Button onClick={this.onEdit} color="primary"  
                                variant="contained">Edit<FontAwesomeIcon icon="paint-brush"  style={{fontSize:'20px',marginLeft:'10px'}}/></Button>
                        </ButtonGroup>
                    }
                    </DialogActions>
                }
            </Dialog>
                   
        )
    }
}

export default DialogDrawing;
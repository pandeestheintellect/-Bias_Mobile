import React, { Component } from 'react';

import { Document, Page,pdfjs } from 'react-pdf';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import {DialogTitle} from './dialog-title'


interface IProps {
    
}

interface IState {
    addDialogOpen:boolean
    pdfFile:string;
    numPages:number;
    pageNumber:number;
}

class DialogPDFViewer extends Component<IProps,{}> {
    state: IState;

    constructor(props:IProps) 
    {
        super(props);

        this.state = {
            
            addDialogOpen:false,
            pdfFile:''    ,
            numPages:0,
            pageNumber:0,
            }
        this.onDocumentLoadSuccess=this.onDocumentLoadSuccess.bind(this)
        this.changePage = this.changePage.bind(this);
        this.previousPage=this.previousPage.bind(this)
        this.nextPage=this.nextPage.bind(this);

        pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";
    }
    onDialogOpen = (pdf:string) => {
        this.setState({addDialogOpen:true,pdfFile:pdf});
    }
    onDialogClose = () => {
        this.setState({addDialogOpen:false});
    }
    onDocumentLoadSuccess(e:any)
    {
        this.setState({numPages:e.numPages,pageNumber:1})
    }
    changePage(offset:number) {
        let page = this.state.pageNumber;
        page+=offset;
        this.setState({pageNumber:page})
    }
    
    previousPage() {
        this.changePage(-1);
    }
    
    nextPage() {
        this.changePage(1);
    }
    render()
    {
        return(
            
            <Dialog fullScreen open={this.state.addDialogOpen} onClose={this.onDialogClose} disableBackdropClick aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title" onClose={this.onDialogClose}>PDF</DialogTitle>
                <DialogContent>
                {
                    this.state.pdfFile.length>10?<div style={{textAlign:'center'}}>
                        <Document file={this.state.pdfFile} 
                        
                        onLoadSuccess={(e)=>this.onDocumentLoadSuccess(e)}
                        ><Page pageNumber={this.state.pageNumber} object-fit='fill' width={window.screen.availWidth}/></Document>
                        
                        </div>
                    :<div>No Pdf available</div>
                }
                </DialogContent>
                <div style={{textAlign:'center'}}>
                            <p>
                            Page {this.state.pageNumber || ( this.state.numPages ? 1 : "--")} of {this.state.numPages || "--"}
                            </p>
                            <button type="button" disabled={this.state.pageNumber <= 1} onClick={this.previousPage}>
                            Previous
                            </button>
                            <button
                            type="button"
                            disabled={this.state.pageNumber >= this.state.numPages}
                            onClick={this.nextPage}
                            >
                            Next
                            </button>
                        </div>
                <DialogActions>

                </DialogActions>
            </Dialog>
                   
        )
    }
}


export default DialogPDFViewer;

import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';


import { downloadProjectSummary, getAssessmentWeightage, getProjectHeader, getProjectWeightage } from '../utilities/project-functions'

import { IAssessmentWeightage, IProject, IProjectWeightage } from '../models/project';
import {  IAssessmentModule } from '../models/assessement';
import { AssessmentTypes } from '../utilities/assessment-functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppBar,ButtonGroup,Button, Toolbar, Typography, IconButton } from '@material-ui/core';
import { ConnectionStatus } from '../components/connection-status';
import { getUserInfo } from '../utilities/user-functions';
import { ProviderContext, withSnackbar } from 'notistack';
import DialogReLogin from '../components/dialogs/dialog-relogin';

type TParams = { projectId: string;fromListing?:string };

interface tableRow {
    type:string,
    cells:tableCell[]
}
interface tableCell {
    cols:number, cellWith:string,cellAllign:any, cellText:string
}
interface IState {
    projectInfo:IProject|null;
    projectWeightage:IProjectWeightage|null;
    projectId:number;
    tableHeader:tableRow[];
    tableData:tableRow[];
    assessmentModule:IAssessmentModule[];
    canEdit:boolean;

}

class AssessmentSummary extends Component<RouteComponentProps<TParams> & ProviderContext,IState> {
    
  
    projectId: number;
    projectWeightage:IProjectWeightage|undefined;
    dialogRelogin= React.createRef<DialogReLogin>();

    constructor(props:RouteComponentProps<TParams> & ProviderContext) {
        super(props);

        this.projectId = parseInt(this.props.match.params.projectId) ;
        this.state =
        {
            projectInfo:null,
            projectWeightage:null,

            tableHeader:[],
            tableData:[],
            assessmentModule:[],
            projectId:0,
            canEdit:true
        } 
        this.onUpdateStatus=this.onUpdateStatus.bind(this)
        this.onProjectHeaderLoad = this.onProjectHeaderLoad.bind(this);
        this.onProjectWeightage = this.onProjectWeightage.bind(this);
        this.onAssessmentWeightage = this.onAssessmentWeightage.bind(this);
        this.getProjectDetailRow = this.getProjectDetailRow.bind(this);

        
    }
    componentDidMount()  {
        if(getUserInfo().isOffline===true)
            this.onUpdateStatus('Process completed'); 
        else
            downloadProjectSummary(this.projectId, this.onUpdateStatus); 
   
    } 
    onUpdateStatus(processStatus:string){
        if(processStatus==='Process completed')
            getProjectHeader(this.projectId,this.onProjectHeaderLoad); 
        else if(processStatus.startsWith('Unauthorized request'))   
            this.dialogRelogin.current?.onDialogOpen(); 
        
    }


    onProjectHeaderLoad(headerInfo:IProject)
    {
        let edit :boolean = headerInfo.assessorType==='Co-Assessor'?false:true;
        this.setState({projectInfo:headerInfo,canEdit:edit});
        getProjectWeightage(this.projectId,this.onProjectWeightage);
    }
    onProjectWeightage(weightage:IProjectWeightage)
    {
        let data:tableRow[]=[];
        data.push({type:'SUMMARYHEADER',cells:this.getSummaryHeaderRow()});
        this.setState({tableHeader:data,projectWeightage:weightage});
        this.projectWeightage = weightage;
        getAssessmentWeightage(this.projectId,this.onAssessmentWeightage);
    }

    onAssessmentWeightage(weightage:IAssessmentWeightage[])
    {
        let data = this.state.tableHeader;
        let assessment:IAssessmentWeightage;
        let summary=[0,0,0,0];
        data.push({type:'HEADING',cells:this.getWorkTypeRow('1.0','Architectural Works')})
        data.push({type:'SUBHEADING',cells:this.getWorkTypeRow('1.1','Internal Finishes')})

        for(let i=1;i<7;i++)
        {
            assessment=weightage.filter((weight)=>weight.typeId===AssessmentTypes.InternalFinishes && weight.moduleId===i)[0];
            data.push({type:'AREATYPE',cells:this.getAssessmentRow('',assessment)})
            summary[0] +=assessment.weightage;
            summary[1] +=assessment.score;
            
        }
        data.push({type:'TOTAL',cells:this.getWorkTypeSummaryRow('',
        summary[0]===0?0:100.00*summary[1]/summary[0],summary[0],summary[1])})

        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})

        assessment=weightage.filter((weight)=>weight.typeId===AssessmentTypes.ExternalWall && weight.moduleId===8)[0];
        if (this.projectWeightage?.externalWallApplicable===1) {

            if(assessment !== undefined)
            {
                data.push({type:'AREATYPE',cells:this.getAssessmentRow('1.2',assessment)})
  
                summary[0] +=assessment.weightage;
                summary[1] +=assessment.score;
            }
            
        }
        else
            data.push({type:'AREATYPE',cells:this.getAssessmentNARow('1.2','External Wall')})
        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})
        assessment=weightage.filter((weight)=>weight.typeId===AssessmentTypes.ExternalWork && weight.moduleId===9)[0];
        if (this.projectWeightage?.externalWorksApplicable===1 ){
            if (assessment !== undefined)
            {
                data.push({type:'AREATYPE',cells:this.getAssessmentRow('1.3',assessment)})
                summary[0] +=assessment.weightage;
                summary[1] +=assessment.score;
            }
        }
        else
            data.push({type:'AREATYPE',cells:this.getAssessmentNARow('1.3','External Works')})
        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})

        assessment=weightage.filter((weight)=>weight.typeId===AssessmentTypes.RoofConsctruction && weight.moduleId===10)[0];
        if (this.projectWeightage?.roofApplicable===1){
            if (assessment !== undefined)
            {
                data.push({type:'AREATYPE',cells:this.getAssessmentRow('1.4',assessment)})
                summary[0] +=assessment.weightage;
                summary[1] +=assessment.score;
            }

        }
        else
            data.push({type:'AREATYPE',cells:this.getAssessmentNARow('1.4','Roof Construction')})

        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})
        assessment=weightage.filter((weight)=>weight.typeId===AssessmentTypes.FieldWindow && weight.moduleId===11)[0];
        if (this.projectWeightage?.fieldWindowWTTApplicable===1) {
            if( assessment !== undefined)
            {
                data.push({type:'AREATYPE',cells:this.getAssessmentRow('1.5',assessment)})
                summary[0] +=assessment.weightage;
                summary[1] +=assessment.score;
            }
            
        }
        else
            data.push({type:'AREATYPE',cells:this.getAssessmentNARow('1.5','Field Window Water-Tightness Test')})
        
        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})
        assessment=weightage.filter((weight)=>weight.typeId===AssessmentTypes.WetArea && weight.moduleId===12)[0];
        if (this.projectWeightage?.wetAreaWTTApplicable===1 && assessment !== undefined){
            if( assessment !== undefined)
            {
                data.push({type:'AREATYPE',cells:this.getAssessmentRow('1.6',assessment)})

            summary[0] +=assessment.weightage;
            summary[1] +=assessment.score;
            }
            
        }
        else
            data.push({type:'AREATYPE',cells:this.getAssessmentNARow('1.6','Wet Area Water-Tightness Test')})
        
        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})

        data.push({type:'TOTAL',cells:this.getWorkTypeSummaryRow('Architectural Works',-1,summary[0],summary[1])})
        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})
        data.push({type:'HEADING',cells:this.getWorkTypeRow('2.0','M&E Works')})
        assessment=weightage.filter((weight)=>weight.typeId===1 && weight.moduleId===7)[0];
        data.push({type:'AREATYPE',cells:this.getAssessmentRow('',assessment)})
        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})
        data.push({type:'TOTAL',cells:this.getWorkTypeSummaryRow("M&E Works",-1,assessment.weightage,assessment.score)})
        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})
        data.push({type:'HEADING',cells:this.getWorkTypeRow('3.0','Total Score')})
        let weigtage = this.projectWeightage?.architectWork as number;
        summary[0] = summary[1] * weigtage /100.00;
        data.push({type:'SUBHEADING',cells:this.getTotalRow('3.1','Architectural Works',summary[1].toFixed(2) + ' x ' + weigtage.toFixed(2) + ' % = '  ,summary[0] )})
        weigtage = this.projectWeightage?.meWork as number;
        summary[1] = assessment.score * weigtage /100.00;

        data.push({type:'SUBHEADING',cells:this.getTotalRow('3.2','M&E Works',assessment.score.toFixed(2) + ' x ' + weigtage.toFixed(2) + ' % = ' ,summary[1])})
        data.push({type:'EMPTYROW',cells:this.getEmptyRow()})
        data.push({type:'FINALSCORE',cells:this.getFinalRow(summary[0]+summary[1])})
        
        this.setState({tableHeader:data});
    }

    getProjectDetailRow=(caption:string,text:string): tableCell[]=>
    {
        let cells:tableCell[]=[];
        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:''})
        cells.push({cols:1, cellWith:'15%',cellAllign:'left', cellText:caption})
        cells.push({cols:2, cellWith:'16%',cellAllign:'left', cellText:text})
        cells.push({cols:4, cellWith:'53%',cellAllign:'left', cellText:''})

        return cells;
    } 
    getProjectWeightageRow=(caption:string,text:string): tableCell[]=>
    {
        let cells:tableCell[]=[];
        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:''})
        cells.push({cols:2, cellWith:'21%',cellAllign:'left', cellText:caption})
        cells.push({cols:1, cellWith:'10%',cellAllign:'right', cellText:text})
        cells.push({cols:4, cellWith:'53%',cellAllign:'left', cellText:''})

        return cells;
    } 
    getSummaryHeaderRow=(): tableCell[]=>
    {
        let cells:tableCell[]=[];

        cells.push({cols:1, cellWith:'3%',cellAllign:'center', cellText:''})
        cells.push({cols:1, cellWith:'15%',cellAllign:'center', cellText:'Assessed Area'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'No. of Compliances'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'No. of Checks'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'Percentage %'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'Weightage'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'Weighted Score'})
        cells.push({cols:1, cellWith:'29%',cellAllign:'center', cellText:'Main Non-Compliances'})

        return cells;
    }
    getWorkTypeRow=(srNo:string,workType:string): tableCell[]=>
    {
        let cells:tableCell[]=[];
        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:srNo})
        cells.push({cols:7, cellWith:'90%',cellAllign:'left', cellText:workType})

        return cells;
    } 
    getAreaTypeRow=(srNo:number,areaType:string): tableCell[]=>
    {
        let cells:tableCell[]=[];
        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:srNo+''})
        cells.push({cols:7, cellWith:'90%',cellAllign:'left', cellText:areaType})

        return cells;
    } 
    getAssessmentRow=(srNo:string,area:IAssessmentWeightage): tableCell[]=>
    {
        let cells:tableCell[]=[];

        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:srNo})
        cells.push({cols:1, cellWith:'15%',cellAllign:'left', cellText:area.moduleName})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:area.compliances+''})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:area.checks+''})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:area.percentage.toFixed(0)+' %'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:area.weightage.toFixed(2)})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:area.score.toFixed(2)})
        cells.push({cols:1, cellWith:'29%',cellAllign:'left', cellText:area.nonCompliance})

        return cells;
    }
    getAssessmentNARow=(srNo:string,caption:string): tableCell[]=>
    {
        let cells:tableCell[]=[];

        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:srNo})
        cells.push({cols:1, cellWith:'15%',cellAllign:'left', cellText:caption})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'Not Applicable'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'Not Applicable'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'Not Applicable'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'Not Applicable'})
        cells.push({cols:1, cellWith:'8%',cellAllign:'center', cellText:'Not Applicable'})
        cells.push({cols:1, cellWith:'29%',cellAllign:'left', cellText:'Not Applicable'})

        return cells;
    }

    getWorkTypeSummaryRow=(workType:string,percent:number,weightage:number,score:number): tableCell[]=>
    {
        let cells:tableCell[]=[];
        if(percent===-1)
        {
            cells.push({cols:5, cellWith:'3%',cellAllign:'left', cellText:workType})
        }
        else{
            cells.push({cols:4, cellWith:'3%',cellAllign:'left', cellText:workType})
            cells.push({cols:1, cellWith:'3%',cellAllign:'center', cellText:percent.toFixed(0)+' %'})
        }
        
        cells.push({cols:1, cellWith:'3%',cellAllign:'center', cellText:weightage.toFixed(2)})
        cells.push({cols:1, cellWith:'3%',cellAllign:'center', cellText:score.toFixed(2)})
        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:''})

        return cells;
    } 
    
    getTotalRow=(srNo:string,caption:string,formula:string,score:number): tableCell[]=>
    {
        let cells:tableCell[]=[];
        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:srNo})
        cells.push({cols:2, cellWith:'23%',cellAllign:'left', cellText:caption})
        cells.push({cols:3, cellWith:'24%',cellAllign:'right', cellText:formula})
        cells.push({cols:1, cellWith:'3%',cellAllign:'right', cellText:score.toFixed(2) + ' %'})
        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:''})
        return cells;
    } 
    getFinalRow=(score:number): tableCell[]=>
    {
        let cells:tableCell[]=[];
        cells.push({cols:6, cellWith:'3%',cellAllign:'left', cellText:'Final Score'})
        cells.push({cols:1, cellWith:'3%',cellAllign:'right', cellText:score.toFixed(2) + ' %'})
        cells.push({cols:1, cellWith:'3%',cellAllign:'left', cellText:''})

        return cells;
    } 
    getEmptyRow=(): tableCell[]=>
    {
        let cells:tableCell[]=[];
        cells.push({cols:9, cellWith:'3%',cellAllign:'left', cellText:''})

        return cells;
    } 
    
    renderTableRow=(tableRow:tableRow,index:number)=>
    {
        let rowstyle:React.CSSProperties={minHeight:'20px'};
        if (tableRow.type==='EMPTYROW')
            rowstyle={height:'30px'}
        else if (tableRow.type==='SUMMARYHEADER')
            rowstyle={backgroundColor:'#faf0f0'}
        else if (tableRow.type==='FINALSCORE')
            rowstyle={fontSize:'24px',fontWeight:'bold'}    
        else if (tableRow.type==='HEADING')
            rowstyle={fontSize:'20px',fontWeight:'bold'}    
        else if (tableRow.type==='SUBHEADING')
            rowstyle={fontSize:'16px',fontWeight:'bold'}
        else if (tableRow.type==='TOTAL')
            rowstyle={fontSize:'18px',fontWeight:'bold'}
        return (
            <tr key={index} style={rowstyle}> 
            {tableRow.cells.map((cell:tableCell, cellindex) => ( 
                this.renderCells(cell.cols,cell.cellWith,cell.cellAllign,cell.cellText,cellindex)
            ))}
            </tr>
        )
    }
    renderCells=(cols:number, cellWith:string,cellAllign:any, cellText:string,index:number)=>
    {
       return (
           <td key={index} colSpan={cols} className={'project-summary-cell'} style={{width:cellWith,textAlign:cellAllign}}>{cellText}</td>
       )
    } 
  
    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='NAVIGATE')
            this.props.history.push(path);
        else if (action==='ASSESS')    
            this.props.history.push(path+this.projectId);           
        else if (action==='SYNC')    
            this.props.history.push('/assessment-sync/project-summary/'+this.projectId);    
    }

    render()
    {
        return (
            <div className={'page'} >
                <AppBar position="sticky">
                    <Toolbar  style={{paddingRight:'0px',backgroundColor: '#F16876',color: '#FFF'}} >

                        {this.props.match.params.fromListing === undefined ?
                            <IconButton style={{marginRight:'10px'}} color="inherit" aria-label="out" size='small' onClick={() => this.onHeaderClick('NAVIGATE','/dashboard')}>
                                <FontAwesomeIcon icon="home" style={{fontSize:'30px'}}/>
                            </IconButton>

                        :
                            <IconButton style={{marginRight:'10px'}} color="inherit" aria-label="out" size='small' onClick={(e:React.MouseEvent<HTMLElement>) => this.onHeaderClick('BACK','')}>
                                <FontAwesomeIcon icon="angle-left" style={{fontSize:'30px'}}/>
                            </IconButton>
                        }
                        

                        <Typography variant="h6" >Project Summary {this.state.canEdit===false?' (View only)':''} </Typography>
                        
                        <Typography variant="h6" style={{flexGrow: 1,textAlign:'center'}}></Typography>
                        
                        <ButtonGroup size="small"  variant="contained" aria-label="small outlined button group">
                            
                            <Button style={{marginRight:4,backgroundColor:'white',color:'#2c61a7',fontWeight:'bold'}} onClick={() => this.onHeaderClick('ASSESS','/assessment-internal-finishes/')}>
                            <FontAwesomeIcon icon="paint-roller"  style={{color:'#2c61a7',marginRight:'10px',fontSize:'20px'}}/> Internal Finishes</Button>
                            {this.state.projectWeightage?.externalWallApplicable===1 && 
                                <Button style={{marginRight:4,backgroundColor:'white',color:'#2c61a7',fontWeight:'bold'}} onClick={() => this.onHeaderClick('ASSESS','/assessment-external-wall/')}>
                                    <FontAwesomeIcon icon="brush"  style={{color:'#2c61a7',marginRight:'10px',fontSize:'20px'}}/> External Wall</Button>}
                            {this.state.projectWeightage?.externalWorksApplicable===1 && 
                                <Button style={{marginRight:4,backgroundColor:'white',color:'#2c61a7'}} onClick={() => this.onHeaderClick('ASSESS','/assessment-external-work/')}>
                                    <FontAwesomeIcon icon="hammer"  style={{color:'#2c61a7',marginRight:'10px',fontSize:'20px'}}/> External Work</Button>}
                            {this.state.projectWeightage?.roofApplicable===1 && 
                                <Button style={{marginRight:4,backgroundColor:'white',color:'#2c61a7'}} onClick={() => this.onHeaderClick('ASSESS','/assessment-roof-construction/')}>
                                    <FontAwesomeIcon icon="hard-hat"  style={{color:'#2c61a7',marginRight:'10px',fontSize:'24px'}}/> Roof</Button>}
                            {this.state.projectWeightage?.fieldWindowWTTApplicable===1 && 
                                <Button style={{marginRight:4,backgroundColor:'white',color:'#2c61a7'}} onClick={() => this.onHeaderClick('ASSESS','/assessment-field-window/')}>
                                    <FontAwesomeIcon icon="border-all"  style={{color:'#2c61a7',marginRight:'10px',fontSize:'24px'}}/> Field Window</Button>}
                            {this.state.projectWeightage?.wetAreaWTTApplicable===1 && 
                                <Button style={{backgroundColor:'white',color:'#2c61a7'}} onClick={() => this.onHeaderClick('ASSESS','/assessment-wet-area/')}>
                                    <FontAwesomeIcon icon="umbrella"  style={{color:'#2c61a7',marginRight:'10px',fontSize:'24px'}}/>Wet Area</Button>}
                        </ButtonGroup>
                        <ConnectionStatus iconOnly={true}/>
                    </Toolbar>
                    
                </AppBar>   
                <div style={{display:'flex',flexDirection:'row'}}>
                    <div style={{width:'80%'}}>
                        {this.state.projectInfo!==null &&
                            <Paper elevation={0} style={{padding:16,width:'96%',marginLeft:10}}>
                                <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                    <div style={{width:'100%',fontSize:'1.4em',lineHeight:'1.6em',fontWeight:700}}>Details</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                    <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Name:</div>
                                    <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectInfo.name}</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                    <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Developer:</div>
                                    <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectInfo.developer}</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                    <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Contractor:</div>
                                    <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectInfo.contractor}</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                    <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Assessors:</div>
                                    <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectInfo.assessors}</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                    <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Date:</div>
                                    <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectInfo.dateOfAssessment}</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'row'}}>
                                    <div style={{width:'15%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Type:</div>
                                    <div style={{width:'85%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectInfo.type}</div>
                                </div>
                            </Paper>
                        }
                        
                    </div> 
                    <div style={{width:'20%'}}>
                        {this.state.projectWeightage!==null &&
                            <Paper elevation={0} style={{padding:16,width:'96%',marginLeft:10}}>
                                <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                    <div style={{width:'100%',fontSize:'1.4em',lineHeight:'1.6em',fontWeight:700}}>Weightages</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                                    <div style={{width:'50%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Architectural:</div>
                                    <div style={{width:'55%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectWeightage.architectWork} %</div>
                                </div>
                                <div style={{display:'flex',flexDirection:'row'}}>
                                    <div style={{width:'55%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>M&E:</div>
                                    <div style={{width:'55%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400}}>{this.state.projectWeightage.meWork} %</div>
                                </div>
                                {this.state.projectInfo?.status==='Completed' &&
                                    <div style={{display:'flex',flexDirection:'row',marginTop:30}}>
                                    <div style={{width:'55%',fontSize:'1.2em',lineHeight:'1.4em',fontWeight:600}}>Status:</div>
                                    <div style={{width:'55%',fontSize:'1.1em',lineHeight:'1.4em',fontWeight:400,color:'#F16876'}}>{this.state.projectInfo?.status} </div>
                                </div>}
                            </Paper>
                        }
                    </div> 
                </div> 
                
                
                
                <Paper elevation={0} className='assessment-unit' style={{padding:16,width:'96%',marginLeft:10}}>
                    <div style={{display:'flex',flexDirection:'row',marginBottom:6}}>
                        <div style={{width:'100%',fontSize:'1.4em',lineHeight:'1.6em',fontWeight:700}}>Score Summary</div>
                    </div>
                <table className={'project-summary'}>
                    <tbody>
                    {this.state.tableHeader.map((row:tableRow, index) => (

                        this.renderTableRow(row,index) 
                    ))}

                    {this.state.tableData.map((row:tableRow, index) => (

                        this.renderTableRow(row,index) 
                    ))}

                    </tbody>
                </table>
            </Paper>
            <DialogReLogin ref={this.dialogRelogin} navigator={this.props}  />
            </div>            
        )
    }
}
export default withRouter(withSnackbar(AssessmentSummary))


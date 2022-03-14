
import React from "react";
import { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import  HeaderPage  from "../components/header-page";
import { IProject } from "../models/project";
import CardAssessment from "../components/card-assessment";



interface IState {
    rowCount:number,
    projectMenuAnchor: Element|null,
    projectMenuOpen:boolean,
    projectCurrentRow:any
}

class AssessmentListing extends Component<RouteComponentProps,IState> {
      
    list = React.createRef<CardAssessment>();
    projectFullList:IProject[];
    projectList:IProject[];

    constructor(props:RouteComponentProps) {
        super(props);
        this.projectFullList=[];
        this.projectList=[];
        
        this.state = {
          
            rowCount:0,
            projectMenuAnchor: null,
            projectMenuOpen:false,
            projectCurrentRow:{}
          }
        this.onHeaderClick = this.onHeaderClick.bind(this)
    }
    
    onSearch(keyword:string)
    {

        this.list.current?.onSearch(keyword)
    }
    
    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='NAVIGATE')
            this.props.history.push(path);  
        else if (action==='SYNC')
            this.list.current?.onLoad()
    }
    
    render(){
        return (
            
            <div className={'page'}>
                <HeaderPage name='Assessment Listing' onSearch={(keyword:string)=>this.onSearch(keyword)} onHeaderClick={(action:string, path:string)=>this.onHeaderClick(action,path)}/>
                <CardAssessment ref={this.list} status='ALL' goBack={true} onHeaderClick={this.onHeaderClick}/>
            </div>
        )
    }
}
export default withRouter(AssessmentListing) ;

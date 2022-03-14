import React, { Component } from 'react'

import IconButton from '@material-ui/core/IconButton'

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import  SearchInput  from './search-text';

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AppBar } from '@material-ui/core';
import { ConnectionStatus } from './connection-status';

interface IProps {
    projectId?:number,
    add?:boolean,
    disable?:boolean,
    name:string,
    onSearch?:(keyword:string)=>void,
    onHeaderClick:(action:string, path:string)=>void
}

interface IState {
    canAdd?:boolean;
    headerMenuAnchor: Element|null,
    headerMenuOpen:boolean
}

class HeaderPage extends Component<IProps,IState> {

    state:IState;

    constructor(props:IProps) {
        super(props);
        this.onOpenMenu = this.onOpenMenu.bind(this);
        this.onCloseMenu = this.onCloseMenu.bind(this);
        this.state={
            canAdd:this.props.add,
            headerMenuAnchor:null,
            headerMenuOpen:false
        }
    }
    onOpenMenu (event:React.MouseEvent<HTMLElement>) {
        let anchorElement = event.currentTarget;
        this.setState({headerMenuAnchor: anchorElement,headerMenuOpen:true});
    }
    onMenuClick(menuReference:string){
        this.onCloseMenu();
        if(this.props.projectId!==undefined)
            this.props.onHeaderClick('NAVIGATE',menuReference+this.props.projectId);
    }
    onCloseMenu (){
        this.setState({headerMenuAnchor: null,headerMenuOpen:false});
    }
    onHeaderClick = (action:string, path:string) =>
    {
        this.props.onHeaderClick(action,path);
    }
    onSearch = (keyword:string) =>
    {
        if(this.props.onSearch !== undefined)
            this.props.onSearch(keyword);
    }
    onBlockEdit()
    {
        this.setState({canAdd:undefined})
    }
    render() {
        return (
            
                <AppBar position="sticky">
                <Toolbar style={{backgroundColor: '#F16876',color: '#FFF'}} >
                    <Tooltip title="navigate to previous window"  arrow>
                    {   this.props.name==='Assessment Listing' ?
                        <IconButton style={{marginRight:'10px'}} color="inherit" aria-label="out" size='small' onClick={() => this.onHeaderClick('NAVIGATE','/dashboard')}>
                            <FontAwesomeIcon icon="home" style={{fontSize:'30px'}}/>
                        </IconButton>

                    :
                        <IconButton style={{marginRight:'10px'}} color="inherit" aria-label="out" size='small' onClick={(e:React.MouseEvent<HTMLElement>) => this.onHeaderClick('BACK','')}>
                            <FontAwesomeIcon icon="angle-left" style={{fontSize:'30px'}}/>
                        </IconButton>
                    }
                    
                    
                    </Tooltip>
                    <Typography variant="h6">
                        {this.props.name} 
                    </Typography>
                    <Typography variant="h6" style={{flexGrow: 1,textAlign:'center'}}>
                    </Typography>
                    {
                        this.props.onSearch !== undefined && <SearchInput  onSearch={this.onSearch}/>
                    }
                    <ButtonGroup size="small" aria-label="small outlined button group" style={{backgroundColor:'white',height:'40px',color:'#2c61a7'}}>
                        
                        {
                        this.state.canAdd!==undefined && 
                        <Tooltip title="Add new entry"  arrow>
                        <Button style={{color:'#2c61a7'}} onClick={(e:React.MouseEvent<HTMLElement>) => this.onHeaderClick('ADD','')}><FontAwesomeIcon icon="plus"  style={{color:'#2c61a7',fontSize:'20px'}}/></Button>
                        </Tooltip>
                        }
                        
                        
                    </ButtonGroup>
                    <ConnectionStatus iconOnly={true}/>
                    
                </Toolbar>
                </AppBar>
                
                    
    
        )
    }

}

export default HeaderPage ;
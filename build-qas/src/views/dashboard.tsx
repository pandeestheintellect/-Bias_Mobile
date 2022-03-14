import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ListItem } from '@material-ui/core';
import {AppBar,  IconButton,Paper } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import CardAssessment from '../components/card-assessment';
import { ConnectionStatus } from '../components/connection-status';
import DialogLogOut from '../components/dialogs/dialog-logout';


import logo from '../images/logo-buildqas.png';
import { getUserInfo } from '../utilities/user-functions';

interface IState {
    winWidth:number;
    showWindow:boolean;
}
class Dashboard extends Component<RouteComponentProps<{}>,IState> {
 
    dialogLogin = React.createRef<DialogLogOut>();
    
    constructor(props:RouteComponentProps<{}>)
    {
        super(props)
        this.onHeaderClick = this.onHeaderClick.bind(this);
        this.onLogoutComplete =this.onLogoutComplete.bind(this)

        this.state = {
            winWidth:1333,
            showWindow:true
          }
    }
    
    componentDidMount()
    {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
        window.addEventListener("orientationchange", this.updateWindowDimensions, false);


    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
        window.removeEventListener("orientationchange", this.updateWindowDimensions);

    }

    updateWindowDimensions = () => {
        let show:boolean=true;
        if (window.screen.availWidth<1333)
            show=false;
        this.setState({ showWindow:show, winWidth:window.screen.availWidth});

        
    };


    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='NAVIGATE')
            this.props.history.push(path);    
      
    }
    onLogout=()=>{
        this.dialogLogin.current?.onDialogOpen('Do you really want to logout?. You can not work offline also.')
    }
    renderList()
    {
        return (
            <ListItem>
                <Paper>

                </Paper> 
            </ListItem>
        )
    }

    onLogoutComplete()
    {
        this.props.history.push('/login');
    }
    render() {
        return (
                       
            <div className={'page'} >
                <AppBar position="sticky">
                    <Toolbar  style={{paddingRight:'0px',backgroundColor: '#F16876',color: '#FFF'}} >
                        <img src={logo} alt="Logo" height={40} style={{marginRight:20}}/>
                        <Typography variant="h6" >Ongoing Assessments</Typography>
                        <IconButton  color="inherit" aria-label="out" onClick={(e)=>this.onHeaderClick('NAVIGATE','/assessment-listing')}>
                            <FontAwesomeIcon icon="th" style={{fontSize:'30px'}}/>
                        </IconButton>
                        <Typography variant="h6" style={{flexGrow: 1,textAlign:'center'}}></Typography>
                        
                        <ConnectionStatus/>
                        
                        {getUserInfo().userName}
                        <IconButton  color="inherit" aria-label="out" onClick={this.onLogout}>
                            <FontAwesomeIcon icon="sign-out-alt" style={{fontSize:'30px'}}/>
                        </IconButton>
                    </Toolbar>
                </AppBar>    
                {
                    this.state.showWindow===false&&
                        <div style={{margin:50,textAlign:'center'}}>
                                <Typography variant="h6" >The application works better with 1333px (and above) wider screen and current screen width is {this.state.winWidth}.</Typography>
                        </div>
                }
                 <CardAssessment status='In-Progress' onHeaderClick={this.onHeaderClick}/>
                <DialogLogOut ref={this.dialogLogin} navigator={this.props} onSubmission={this.onLogoutComplete} />

                </div>
        );
    }
}
export default withRouter(Dashboard);


import React, { Component } from 'react';
import { withSnackbar,ProviderContext } from 'notistack';
import Background from '../images/buildqas-bg.png';
import Logo from '../images/icon.png';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {doLogin, getUserInfo,onLoad, setUserInfo} from '../utilities/user-functions'
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import DialogLoginConfirm from '../components/dialogs/dialog-login-confirm';
import { checkOnline } from '../utilities/master-functions';

interface IProp {
    onLogginSuccess:()=>void;
}
interface IState {
    userId:string;
    password:string;
    continueLogin:boolean;
    isLoading:boolean;
    isOnline:boolean;
}
class Login extends Component<RouteComponentProps<{}> & ProviderContext & IProp,IState> {
    
    dialogLogin = React.createRef<DialogLoginConfirm>();
    state:IState;

    constructor(props:RouteComponentProps<{}>& ProviderContext& IProp)
    {
        super(props)

        this.state = { 
            userId : '',
            password:'',
            continueLogin:false,
            isLoading:false,
            isOnline:false
        }

        this.onLoginSuccess=this.onLoginSuccess.bind(this);
        this.onAppInit=this.onAppInit.bind(this);
        this.forceLogin = this.forceLogin.bind(this);
        this.isOnline=this.isOnline.bind(this);
    }
    componentDidMount()
    {
        onLoad(this.onAppInit);
        checkOnline(this.isOnline)
    }
    isOnline(status:boolean)
    {
        
        if (status)
        {
            this.setState({isOnline:true})
        }
    }
        
        
    
    onAppInit()
    {
        if (getUserInfo().userName!=='Guest')
        {
            
            this.setState({continueLogin:true})
        }
            
    }
    forceLogin()
    {
        this.loginClick(true)
    }
    loginClick(forceLogin:boolean) {
        
        if (this.state.userId.trim().length >0 && this.state.password.trim().length >0)
        {
            this.setState({isLoading:true})
            doLogin(this.state.userId.trim(),this.state.password.trim(),forceLogin,this.onLoginSuccess)
        }
        else
            this.props.enqueueSnackbar('Please enter valid user id and password',{ 
                variant: 'warning',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                }
            });

    }
    onContinueLogin()
    {
        let user = getUserInfo();
        user.isLoggedIn = true;
        user.isOffline = true;
        setUserInfo(user)
        this.props.history.push('/dashboard');
    }
    onLoginSuccess(success:string,isLoggedIn:boolean)
    {
        this.setState({isLoading:false})
        if (success==='OKAY')
        {
            this.props.onLogginSuccess();
            this.props.history.push('/intro');
        }
        else if(isLoggedIn===true)
        {
            this.dialogLogin.current?.onDialogOpen(success)
        }
        else
            this.props.enqueueSnackbar(success,{ 
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                }
            });
    }
    render() {
        return (
            <div style={{
                background: `url(${Background}) no-repeat center`,
                backgroundSize: 'cover',
                width:'100%',height:"100vh",color:'white',
                display:'flex',justifyContent:'center',flexDirection:'column'
            
              }}>
                
                <div style={{display:'flex',justifyContent:'center'}}>
                    <h1 style={{fontSize:'3em',lineHeight:'1.4em',margin:'0 auto 0 auto',
                                    fontWeight:400,letterSpacing:'-0.01em',}} >Building Quality Assessment System</h1>
                </div>

                <div style={{display:'flex',justifyContent:'center'}}>
                     <h2 style={{fontSize:'2em',lineHeight:'1.8em',margin:'15px auto 0 auto',
                                    fontWeight:300,letterSpacing:'-0.01em',}}>Making Quality is Our Priority.</h2>
                </div>

                <div style={{display:'flex',justifyContent:'center'}}>
                    <Avatar alt="avatar log" src={Logo} style={{width:'200px', height:'200px',alignSelf:'center', margin:'20px' }}/>    
                </div>
                
                <div style={{display:'flex',justifyContent:'center'}}>
                    <form  noValidate autoComplete="off" 
                        style={{padding:30, display:'flex',flexDirection:'column',backgroundColor:'white',width:430,borderRadius:20}}>
                            <TextField style={{margin:10}} label="User id"  variant="outlined" value={this.state.userId} 
                                onChange={(e)=>this.setState({userId:e.target.value})}/>
                            <TextField label="Password" type="password" variant="outlined" value={this.state.password} onChange={(e)=>this.setState({password:e.target.value})}
                                style={{margin:10}}/>
                            
                            {
                                this.state.isLoading ?
                                <div style={{display:'flex',flexDirection:'row',justifyContent:'center',marginTop:10}}>
                                <CircularProgress />
                                </div>
                                :


                                <div style={{display:'flex',flexDirection:'row',justifyContent:'center',marginTop:10}}>
                                    {this.state.isOnline && <Button 
                                        onClick={()=>this.loginClick(false)}
                                        variant="contained"
                                        color="primary" 
                                        style={{height:'56px',width:'200px'}}
                                    >
                                        Login  <FontAwesomeIcon icon="sign-in-alt" style={{marginLeft:'20px',fontSize:'26px'}}/> 
                                    </Button>
                                    }
                                    {this.state.continueLogin &&
                                    <Button 
                                        onClick={this.onContinueLogin.bind(this)}
                                        variant="contained"
                                        style={{backgroundColor:'#009688', color:'white', height:'56px',width:'200px', marginLeft:'10px'}}
                                    >
                                        work Offline  <FontAwesomeIcon icon="retweet" style={{marginLeft:'20px',fontSize:'26px'}}/>
                                    </Button>
                                    }
                                    </div>

                            }
                        </form>

                </div>
                <DialogLoginConfirm ref={this.dialogLogin} onSubmission={this.forceLogin} />
            </div>
        );
    }
}
export default withRouter(withSnackbar(Login))
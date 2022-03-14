import React, { Component } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import logo from '../../images/logo-buildqas.png';

import { getUserInfo } from "../../utilities/user-functions";

import  NavigationMenu from './navigation-menu'

import NavigationLogout from './navigation-logout';

interface IProp {
  onLogout:()=>void;
}

interface IState {
  isDisconnected: boolean;
}


class NavigationBar extends Component<IProp,IState> {

  state = {
    isDisconnected: false
  }
/*
  componentDidMount() {
    this.handleConnectionChange();
    window.addEventListener('online', this.handleConnectionChange);
    window.addEventListener('offline', this.handleConnectionChange);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleConnectionChange);
    window.removeEventListener('offline', this.handleConnectionChange);
  }
  

  handleConnectionChange = () => {
    const condition = navigator.onLine ? 'online' : 'offline';
    if (condition === 'online') {
      const webPing = setInterval(
        () => {
          fetch('//google.com', {
            mode: 'no-cors',
            })
          .then(() => {
            this.setState({ isDisconnected: false }, () => {
              return clearInterval(webPing)
            });
          }).catch(() => this.setState({ isDisconnected: true }) )
        }, 2000);
      return;
    }

    return this.setState({ isDisconnected: true });
  }
*/
  onLogout = () => {
    this.props.onLogout();
  };

  render()
  {
    return (
      <div style={{flexGrow: 1}}>

        <AppBar position="static" style={{background: '#fff',color:'#888'}}>
          <Toolbar style={{marginTop:'6px'}}>
            {getUserInfo().isLoggedIn && <NavigationMenu/>}
            <img src={logo} alt="Logo" height={40}/>
            <Typography variant="h6" style={{flexGrow: 1}}>
              
            </Typography>
            {
              this.state.isDisconnected && <div>Offline</div>
            }
            {getUserInfo().isLoggedIn && <div>
              {getUserInfo().userName}
              </div>}
            {getUserInfo().isLoggedIn && <NavigationLogout onLogout={this.onLogout}/>}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
      
}
   
export default NavigationBar;
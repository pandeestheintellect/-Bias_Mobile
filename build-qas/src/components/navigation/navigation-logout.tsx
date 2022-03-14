
import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import {RouteComponentProps, withRouter } from "react-router-dom";

import {updateUserInfo} from '../../utilities/user-functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


interface IProps {
  onLogout:()=>void;
}

class NavigationLogout extends Component<RouteComponentProps<{}>& IProps> {
      
  onLogout = () => {
    updateUserInfo('isloggedin',false);
    this.props.onLogout();
    this.props.history.push('/login');
  };

  render ()
  {
      return (
        <>
          <IconButton  color="inherit" aria-label="out" onClick={this.onLogout}>
          <FontAwesomeIcon icon="sign-out-alt" />
          </IconButton>
          </> 
      )
  }
    
}
export default withRouter(NavigationLogout) ;

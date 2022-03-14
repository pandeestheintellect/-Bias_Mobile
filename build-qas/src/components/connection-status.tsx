import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import React from 'react';
import { getUserInfo } from '../utilities/user-functions';

interface IProp {
    iconOnly?:boolean;
}
export  function ConnectionStatus (prop:IProp) {

    
    if (getUserInfo().isOffline===false)
    {
        return (<FontAwesomeIcon icon="wifi" style={{marginLeft:10,marginRight:10,fontSize:'30px'}}/>)    
    }
    else if (getUserInfo().isOffline===true && (prop.iconOnly !==undefined && prop.iconOnly ===true) )
        return (
            <FontAwesomeIcon icon="unlink" style={{marginLeft:10,marginRight:10,fontSize:'30px'}}/>
        )
    if (getUserInfo().isOffline===true )
        return (
            <span style={{minHeight:60,display:'inline-flex',alignItems:'center'}}>
                Working offline <FontAwesomeIcon icon="unlink" style={{marginLeft:10,marginRight:10,fontSize:'30px'}}/>
            </span>
         
        )    
    else
        return (<span></span>)    
 }
  
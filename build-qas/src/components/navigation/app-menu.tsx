import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'

import List from '@material-ui/core/List'

import AppMenuItem from './app-menu-item'

import { AuthRoutes,IMenu } from '../../models/routes';
import logo from '../../images/icon.png';

import Avatar from '@material-ui/core/Avatar'

import { getUserInfo } from '../../utilities/user-functions';
import { getVersion } from '../../utilities/master-functions';
import { Typography } from '@material-ui/core';

const appMenuItems:IMenu[] = [
  {
    name: 'Dashboard',
    link: AuthRoutes.dashboard,
    Icon: "chalkboard",
    items:[]
  },
  {
    name: 'Masters',
    link: '',
    Icon: 'window-restore',
    items:[
      {
        name: 'Modules',
        link: '/masters/modules',
        Icon: 'layer-group'
      },
      {
        name: 'Location',
        link: '/masters/location',
        Icon: 'location-arrow'
      },
      {
        name: 'Process',
        link: '/masters/process',
        Icon: 'search'
      },
      {
        name: 'Joint',
        link: '/masters/joint',
        Icon: 'crop-alt'
      },
      {
        name: 'Leak',
        link: '/masters/leak',
        Icon: 'braille'
      },
      {
        name: 'Wall',
        link: '/masters/wall',
        Icon: 'align-justify'
      },
      {
        name: 'Window',
        link: '/masters/window',
        Icon: 'border-all'
      }
    ]
  },
  {
    name: 'Assessments',
    link: AuthRoutes.assessmentListing,
    Icon: 'balance-scale',
    items:[]
  },
  {
    name: 'Get App Update',
    link: '/check-for-update',
    Icon: "sync",
    items:[]
  }
]

interface IProps {
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const AppMenu: React.FC<IProps> = props => 
{
  const {onClick} = props
  const classes = useStyles()

  function handleClick(event: React.MouseEvent<HTMLElement>) {
     
    if((event.target as HTMLElement).textContent==='Get App Update')
      window.location.reload();
    else
      onClick(event);
  }
  
  return (
    <>
    <Avatar alt="avatar log" src={logo} style={{width:'120px', height:'120px',alignSelf:'center', margin:'20px' }}/>

    <Typography variant="h6" style={{marginLeft:'20px',marginBottom:'20px',color:'white',textAlign:'center'}}> Welcome: {getUserInfo().userName}</Typography>
    <Typography variant="h6" style={{marginLeft:'20px',marginBottom:'20px',color:'white',textAlign:'center'}}> App Version: {getVersion()}</Typography>


    <List component="nav" className={classes.appMenu} disablePadding>
      {appMenuItems.map((item, index) => (
        <AppMenuItem  name={item.name} link={item.link} Icon={item.Icon} items={item.items}  
           key={index} onClick={handleClick}/>
      ))}
    </List>
    </>
  )
}

const drawerWidth = 240

const useStyles = makeStyles(theme =>
  createStyles({
    appMenu: {
      width: '100%'
      
    },
    navList: {
      width: drawerWidth,
    },
    menuItem: {
      width: drawerWidth,
    },
    menuItemIcon: {
      color: '#F16876',
    },
  }),
)

export default AppMenu
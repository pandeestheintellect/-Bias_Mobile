
import React from 'react';
import IconButton from '@material-ui/core/IconButton';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

import AppMenu from './app-menu'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar:{
        background: '#fff',
        color:'#888'
    },
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    drawer: {
      width: 300,
      backgroundColor:'#F16876',
    },
    fullList: {
      marginTop:'60px !important;',
      width: 'auto',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    button: {
      margin: theme.spacing(1),
    },
  }),
);

const NavigationMenu: React.FC = () => {

  const [isOpen, setIsOpen] = React.useState(false);
  const classes = useStyles();
    
    const toggleDrawer = (open: boolean) => (
      event: React.KeyboardEvent | React.MouseEvent,
    ) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
  
      setIsOpen(open);
    };

    function handleClick(event: React.MouseEvent<HTMLElement>) {
      setIsOpen(false);
    }

    return (
        <>
          <IconButton edge="start" color="inherit" aria-label="menu"
                 aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={toggleDrawer(true)}
                >
              <FontAwesomeIcon icon="bars" />
            </IconButton>
            <Drawer classes={{ paper: classes.drawer }} open={isOpen} onClose={toggleDrawer(false)}>
            <AppMenu onClick={handleClick}/>
            </Drawer>
          </> 
      )
            }

export default NavigationMenu;
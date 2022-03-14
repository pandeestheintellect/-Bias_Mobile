import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
// import { SvgIconProps } from '@material-ui/core/SvgIcon'

import List from '@material-ui/core/List'

import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Collapse from '@material-ui/core/Collapse'

import AppMenuItemComponent from './app-menu-item-component'
import {IMenuItem} from '../../models/routes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
interface IAppMenuItemProps {
  name: string,
  link?: string,
  Icon?: any,
  items?:IMenuItem [],
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const AppMenuItem: React.FC<IAppMenuItemProps> = props => 
{
  const { name, link, Icon, items = [],onClick} = props
  const classes = useStyles()
  const isExpandable = items && items.length > 0
  const [open, setOpen] = React.useState(false)

  function handleRootClick(event: React.MouseEvent<HTMLElement>) {
    setOpen(!open)
  }

  function handleChildrenClick(event: React.MouseEvent<HTMLElement>) {
    onClick(event);
  }

  const MenuItemRoot = (
    <AppMenuItemComponent className={classes.menuItem} link={link} onParentClick={handleRootClick} onItemClick={handleChildrenClick}>
      {/* Display an icon if any */}
      {!!Icon && (
        <ListItemIcon className={classes.menuItemIcon}>
          <FontAwesomeIcon icon={Icon} style={{fontSize:'26px'}}/>
        </ListItemIcon>
      )}
      <ListItemText primary={name} inset={!Icon} />
      {/* Display the expand menu if the item has children */}
      {isExpandable && !open && <FontAwesomeIcon icon="angle-up" style={{fontSize:'26px'}}/>}
      {isExpandable && open && <FontAwesomeIcon icon="angle-down" style={{fontSize:'26px'}}/>}
    </AppMenuItemComponent>
  )

  const MenuItemChildren = isExpandable ? (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Divider />
      <List component="div" disablePadding style={{backgroundColor:'#f08080'}}>
        {items.map((item, index) => (
          <AppMenuItem name={item.name} link={item.link} Icon={item.Icon} items={[]}  
          key={index} onClick={handleChildrenClick}  />
        ))}
      </List>
    </Collapse>
  ) : null

  return (
    <>
      {MenuItemRoot}
      {MenuItemChildren}
    </>
  )
}

const useStyles = makeStyles(theme =>
  createStyles({
    menuItem: {
      fontSize:'18px',
      color: '#fff',
      '&.active': {
        background: 'rgba(0, 0, 0, 0.08)',
        '& .MuiListItemIcon-root': {
          color: '#fff',
        },
      },
    },
    menuItemIcon: {
      color: '#fff',
    },
  }),
)

export default AppMenuItem
import React, { forwardRef } from 'react'
import ListItem from '@material-ui/core/ListItem'
import { NavLink, NavLinkProps } from 'react-router-dom'

export interface AppMenuItemComponentProps {
  className?: string
  link?: string | null // because the InferProps props allows alows null value
  onParentClick?: (event: React.MouseEvent<HTMLElement>) => void,
  onItemClick?: (event: React.MouseEvent<HTMLElement>) => void
}

const AppMenuItemComponent: React.FC<AppMenuItemComponentProps> = props => {
  const { className, onParentClick, onItemClick,link, children } = props

  // If link is not set return the orinary ListItem
  if (!link || typeof link !== 'string' || link === '-') {
    return (
      <ListItem
        button
        className={className}
        children={children}
        onClick={onParentClick}
      />
    )
  }

  // Return a LitItem with a link component
  return (
    <ListItem
      button
      className={className}
      children={children}
      onClick={onItemClick}
      component={forwardRef((props: NavLinkProps, ref: any) => <NavLink exact {...props} innerRef={ref} />)}
      to={link}
    />
  )
}

export default AppMenuItemComponent
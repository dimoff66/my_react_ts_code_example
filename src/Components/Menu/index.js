import React from 'react'
import MuiMenu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import onClickOutside from 'react-onclickoutside'

import styles from './styles.module.css'
import StyledElement, { convertPropsToClassName } from '../StyledElement';
import Button from '../Buttons/Button'

const Menu = props => {
  const {items, onClick: onClickHandler, ...elementProps} = 
    convertPropsToClassName(props, styles.Wrapper)

  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = (event) => { setAnchorEl(event.currentTarget) }
  const handleClose = onClick => () => { 
    (onClick || onClickHandler)()
    setAnchorEl(null) 
  }

  Menu.handleClickOutside = () => setAnchorEl(null)

  return (
    <StyledElement ContentCenter {...elementProps}>
      <Button type="menu"><MoreVertIcon  
        className={styles.MenuIcon}
        aria-controls="my-menu" 
        aria-haspopup="true" 
        onClick={handleClick} 
      /></Button>
  
      <MuiMenu
        id="my-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >{items.map(({ label, onClick }) => 
          <MenuItem onClick={handleClose(onClick)}>
            {label}
          </MenuItem>
          )}
      </MuiMenu>
    </StyledElement>
  );
}

/* const clickOutsideConfig = {
  handleClickOutside: () => Menu.handleClickOutside
}; */

export default Menu
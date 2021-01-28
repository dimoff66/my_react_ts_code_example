import React from 'react'
import MuiMenu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

import styles from './styles.module.css'
import StyledElement, { convertPropsToClassName } from '../StyledElement';
import Button from '../Buttons/Button'
import MenuList from '@material-ui/core/MenuList'

const Menu = props => {
  const {items, onClick: onClickHandler, ...elementProps} = 
    convertPropsToClassName(props, styles.Wrapper)

  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = (event) => { setAnchorEl(event.currentTarget) }
  const handleClose = onClick => () => { 
    (onClick || onClickHandler)()
    setAnchorEl(null) 
  }

  const handleClickOutside = (e) => {
    const getClassNames = (el, arr = []) => {
      arr.push(el.className.toString())
      if (el.parentElement && arr.length < 3) getClassNames(el.parentElement, arr)
      return arr
    }

    const classNames = getClassNames(e.path[0])
    if (classNames.some(n => n.includes('VertIconButton'))) return

    setAnchorEl(null)
  }

  return (
    <StyledElement ContentCenter {...elementProps}>
      
        <Button type="menu" className={styles.VertIconButton}>
          <MoreVertIcon  
            className={styles.MenuIcon}
            aria-controls="my-menu" 
            aria-haspopup="true" 
            onClick={handleClick} 
          />
        </Button>
      
      
        <MuiMenu
          id="my-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <ClickAwayListener  onClickAway={handleClickOutside}>
            <MenuList>
              {items.map(({ label, onClick }) => 
                <MenuItem onClick={handleClose(onClick)}>
                  {label}
                </MenuItem>
              )}  
            </MenuList>
          </ClickAwayListener>
        </MuiMenu>
    </StyledElement>
  );
}

/* const clickOutsideConfig = {
  handleClickOutside: () => Menu.handleClickOutside
}; */

export default Menu
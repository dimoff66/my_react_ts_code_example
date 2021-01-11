import React from 'react'
import { convertPropsToClassName } from "../../StyledElement"
import styles from './styles.module.css'

const ButtonClose = props => {
  props = { ...props,  styles }
  const elementProps = convertPropsToClassName(props, styles.ButtonClose)

  return <a {...elementProps}>✖</a>
}

export default ButtonClose
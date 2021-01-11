import React from 'react';
import styles from './styles.module.css'
import { convertPropsToClassName } from '../../StyledElement';
import { FlexRow } from '../../FlexContainer';

const Button = props => {
  const { disabled, type } = props
  const typeClassName = type?.toLowerCase() || ''
  const elementPropsRaw = convertPropsToClassName(
    props, 
    styles.Button, 
    styles[typeClassName]
  )

  if ('value' in elementPropsRaw) {
    const { value, onClick } = elementPropsRaw

    elementPropsRaw.onClick = () => onClick(value)
    delete elementPropsRaw.value
  }
  if (disabled) delete elementPropsRaw.onClick
  

  const { title, children, reference, ...elementProps } = elementPropsRaw
  
  return <a ref={reference} {...elementProps}>   
      {children || title}  
  </a>
}

export default Button
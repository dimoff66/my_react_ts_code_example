import React from 'react'
import StyledElement, { commonStylesIsSet, setCommonStyles } from "../StyledElement"
import styles from '../../styles.module.css'

if (!commonStylesIsSet()) {
  setCommonStyles(styles)
}

const getFlexContainer = (props, mainClass) => {
  const elementProps = {...props, [mainClass]: true }
  return <StyledElement {...elementProps} />
}

export const FlexColumn = props => getFlexContainer(props, 'FlexColumn')
export const FlexRow = props => getFlexContainer(props, 'FlexRow')
import React from 'react'
import _ from 'lodash'

const StyledElement = props => {
  const elemProps = convertPropsToClassName(props)
  const { tag: TagName = 'div', children } = props

  delete elemProps.tag
  delete elemProps.children

  if (props.dangerouslySetInnerHTML)
    return (<TagName {...elemProps} />)  

  return (<TagName {...elemProps}> { children } </TagName>)
}

let commonStyles
export const setCommonStyles = styles => {
  commonStyles = styles
}

export const commonStylesIsSet = () => Boolean(commonStyles)

export const convertPropsToClassName = (props, ...classNames) => {
  let styles = commonStyles || {}
  if (props.styles) styles = {...styles, ...props.styles }

  const classesInProps = Object.keys(props).filter(prop => (prop in styles) && props[prop])
    
  classNames = [
    ...classNames.filter(Boolean),
    ...classesInProps.map(prop => styles[prop]),
    props.className || [],
  ]

  const restProps = _.omit(props, [...classesInProps, 'styles'])
  restProps.className = classNames.flat().join(' ')

  return restProps
}

export const joinStyles = (styles, joinMap) => {
  const joinedStyles = {...styles}

  for (const key in joinMap) {
    const joinedKeys = [joinMap[key]].flat()
    const names = [key, ...joinedKeys].map(className => styles[className]).filter(Boolean)
    joinedStyles[key] = names.join(' ')
  }

  return joinedStyles
}

export const joinClassNames = (...classNames) => 
  classNames.filter(Boolean).join(' ')

export default StyledElement



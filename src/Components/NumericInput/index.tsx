import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { Dict } from '../../CommonTypes'
import Button from '../Buttons/Button'
import { FlexColumn, FlexRow } from '../FlexContainer'
import { joinClassNames, joinStyles } from '../StyledElement'

import componentStylesRaw from './styles.module.css'
const componentStyles = joinStyles(
  componentStylesRaw, 
  { ButtonMinus: 'Button', ButtonPlus: 'Button' }
)

type Props = {
  value: number 
  onChange: (v: number) => any
  min?: number 
  max?: number
  className?: string
}

const ButtonStyle = {
  height: '30px',
  width: '30px'
}

const NumericInput: FunctionComponent<Props> = props => {

  const { value, onChange, min, max, className } = props

  const onButtonsClickHandler = (changeValue: 1 | -1) => 
    () => {
      const newValue = changeValue + value 
      if (min !== undefined && newValue < min) return  
      if (max !== undefined && newValue > max) return  

      onChange(newValue)
    }

  const onMinusClickHandler = useCallback(onButtonsClickHandler(-1), [value, onChange, min, max])
  const onPlusClickHandler = useCallback(onButtonsClickHandler(1), [value, onChange, min, max])
  
  const containerClassName = useMemo(
    () => joinClassNames(componentStyles.InputContainer, className),
    [className]
  )

  return <FlexRow className={containerClassName}>
    <Button 
      className={componentStyles.ButtonMinus} 
      onClick={onMinusClickHandler}>-</Button>

    <FlexColumn ContentCenter className={componentStyles.Number}>
      {value}
    </FlexColumn>

    <Button 
      className={componentStyles.ButtonPlus} 
      onClick={onPlusClickHandler}>+</Button>
  </FlexRow>
} 

export default NumericInput
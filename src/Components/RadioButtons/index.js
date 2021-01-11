import React from 'react';
import styles from './styles.module.css'

import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import { FormControlLabel } from '@material-ui/core'

const RadioButtons = ({ value, buttons, onChange, ...extraProps }) => {
  const onChangeHandler = e => onChange(e.target.value)

  return (
    <RadioGroup row value={value} onChange={onChangeHandler} {...extraProps}>
      {buttons.map(([value, label]) => 
        <FormControlLabel label={label} value={value} control={<Radio />} />
        )}
    </RadioGroup>
  )
}

export default RadioButtons
import MenuItem from '@material-ui/core/MenuItem';
import MuiSelect from '@material-ui/core/Select';
import React from 'react';
import { Dict, ValueViewInfo } from '../../CommonTypes';
import { first } from '../../Utils/index';

type Props = {
  style?: Dict<any>
  className?: string
  iconClassName?: string
  value: any 
  options: ValueViewInfo[]
  onChange: (value: any) => any
  emptyValueTip?: string | false
}

const Select: React.FC<Props> = ({ 
  style = {}, className = '', iconClassName = '', value, 
  options, onChange, emptyValueTip = '<choose option>', 
  ...extraProps }) => {

  const selectValue = 
    (value?.isModelInstance && 
      options.map(first).find(opt => opt.isEqual(value))
    ) || value || ''

  const onChangeHandler = (e: React.ChangeEvent<{ value: any }>) => {
    const value = e.target.value
    if (value !== '') onChange(value)
  }

  return (
    <MuiSelect 
      style={style} 
      classes={{ root: className, icon: iconClassName }}
       value={selectValue} 
       onChange={onChangeHandler} 
       {...extraProps}>

      {emptyValueTip !== false && <MenuItem value=""><em>{emptyValueTip}</em></MenuItem>}
      
      {options.map(([value, label]) => 
        <MenuItem value={value}>{label}</MenuItem>
        )}
    </MuiSelect>
  )
}

export default Select
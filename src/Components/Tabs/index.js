import React from 'react';
import styles from './styles.module.css'

import MuiTabs from '@material-ui/core/Tabs'
import MuiTab from '@material-ui/core/Tab'

const Tabs = ({ value, tabs, onChange, ...extraProps }) => {

  const onChangeHandler = (e, tab) => onChange(tab, e)

  return (
    <MuiTabs 
      aria-label={'some label'}
      value={value} 
      onChange={onChangeHandler}
      {...extraProps}
    >
      {tabs.map(([value, label, { disabled } = {}]) => 
        <MuiTab disableRipple label={label} value={value} disabled={disabled} />
      )}
    </MuiTabs>
  )
}

export default Tabs
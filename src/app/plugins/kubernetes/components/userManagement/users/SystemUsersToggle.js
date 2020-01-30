import { FormControlLabel, Switch } from '@material-ui/core'
import React from 'react'

const SystemUsersToggle = ({ checked, toggle }) => {
  return <FormControlLabel
    control={
      <Switch onChange={toggle} checked={checked} />
    }
    label="Show System Users"
    labelPlacement="start"
  />
}

export default SystemUsersToggle

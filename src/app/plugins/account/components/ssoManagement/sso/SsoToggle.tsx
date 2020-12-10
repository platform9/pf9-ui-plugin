import { FormControlLabel, Switch } from '@material-ui/core'
import React from 'react'

interface Props {
  checked: boolean
  onClick?: any
}

const SsoToggle = ({ checked, onClick }: Props) => {
  return (
    <FormControlLabel
      control={<Switch checked={checked} onClick={onClick} />}
      label="Enable SSO"
      labelPlacement="end"
    />
  )
}

export default SsoToggle

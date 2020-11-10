import React from 'react'
import Input from 'core/elements/input'
import MenuItem from '@material-ui/core/MenuItem'

export enum LoginMethodTypes {
  Local = 'local',
  SSO = 'sso',
}

interface Props {
  id: string
  label: string
  value: LoginMethodTypes
  variant?: 'light' | 'dark'
  onChange?: any
}

const options = [
  { label: 'Local Credentials', value: LoginMethodTypes.Local },
  { label: 'Single Sign On', value: LoginMethodTypes.SSO },
]

const LoginMethodPicklist = ({ ...rest }: Props) => (
  <Input select {...rest}>
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </Input>
)

export default LoginMethodPicklist

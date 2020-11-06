import React from 'react'
// import PicklistDefault from 'core/components/Picklist'
import Input from 'core/elements/input'
import MenuItem from '@material-ui/core/MenuItem'
// const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

interface Props {
  id: string
  label: string
  value: string
  variant?: 'light' | 'dark'
  onChange?: any
}

const LoginMethodPicklist = ({ ...rest }: Props) => {
  const options = [
    { label: 'Single Sign On', value: 'sso' },
    { label: 'Local Credentials', value: 'local' },
  ]

  return (
    <Input select {...rest}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Input>
  )
  // return <Picklist {...rest} options={options} showAll={false} />
}

export default LoginMethodPicklist

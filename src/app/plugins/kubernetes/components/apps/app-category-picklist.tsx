import React from 'react'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const options = [
  { label: 'warning', value: 'warning' },
  { label: 'critical', value: 'critical' },
  { label: 'fatal', value: 'fatal' },
]

interface Props {
  value: string
  onChange: (value: string) => void
}

const AppCategoryPicklist = ({ value, onChange }: Props) => {
  return (
    <Picklist
      name="categories"
      label="Categories"
      value={value}
      options={options}
      onChange={onChange}
    />
  )
}

export default AppCategoryPicklist

import React, { forwardRef, useEffect } from 'react'
import { propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const options = [
  { label: 'Active', value: 'Active' },
  { label: 'Suppressed', value: 'Suppressed' },
  { label: 'Closed', value: 'Closed' },
]

interface Props {
  name: string
  label: string
  value: string
  selectFirst: boolean
  onChange: (value: string) => void
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const StatusPicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>((props, ref) => {
  const { onChange, value, name = 'status', label = 'Status', selectFirst = false } = props

  // Select the first item as soon as data is loaded
  useEffect(() => {
    if (selectFirst) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [])

  return (
    <Picklist
      name={name}
      label={label}
      value={value}
      ref={ref}
      onChange={onChange}
      options={options}
    />
  )
})

export default StatusPicklist

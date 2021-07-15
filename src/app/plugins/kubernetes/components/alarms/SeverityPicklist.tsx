import React, { forwardRef, useEffect } from 'react'
import { propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const options = [
  { label: 'warning', value: 'warning' },
  { label: 'critical', value: 'critical' },
  { label: 'fatal', value: 'fatal' },
]

interface Props {
  name?: string
  label?: string
  value: string
  selectFirst: boolean
  onChange: (value: string) => void
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const SeverityPicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  // ( name = 'severity', label = 'Severity', onChange, selectFirst = true, ...rest }, ref) => {
  (props, ref) => {
    const { onChange, value, name = 'severity', label = 'Severity', selectFirst = false } = props

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
  },
)

export default SeverityPicklist

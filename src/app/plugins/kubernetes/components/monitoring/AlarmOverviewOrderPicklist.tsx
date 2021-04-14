import React, { forwardRef, useEffect } from 'react'
import { propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

// values match with moment's add/subtract API for use in actions.js
const options = [
  { label: 'High to Low', value: 'highToLow' },
  { label: 'Low to High', value: 'lowToHigh' },
]

interface Props {
  value: string
  onChange: (value: string) => void
  name?: string
  label?: string
  selectFirst?: boolean
  formField?: boolean
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const AlarmOverviewOrderPicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  (props, ref) => {
    const {
      onChange,
      value,
      name = 'order',
      label = 'Sort',
      selectFirst = true,
      formField = false,
      ...rest
    } = props

    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (selectFirst) {
        onChange(propOr(allKey, 'value', head(options)))
      }
    }, [])

    return (
      <Picklist
        {...rest}
        name={name}
        label={label}
        value={value}
        ref={ref}
        onChange={onChange}
        options={options}
        showAll={false}
        formField={formField}
        className="validatedFormInput"
      />
    )
  },
)

export default AlarmOverviewOrderPicklist

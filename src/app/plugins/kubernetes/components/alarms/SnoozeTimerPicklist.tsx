import React, { forwardRef, useEffect } from 'react'
import { propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

// values match with moment's add/subtract API for use in actions.js
const options = [
  { label: '15 Minutes', value: '15.m' },
  { label: '30 Minutes', value: '30.m' },
  { label: '1 Hour', value: '1.h' },
  { label: '4 Hours', value: '4.h' },
  { label: '12 Hours', value: '12.h' },
  { label: '24 Hours', value: '24.h' },
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
const SnoozeTimerPicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  (props, ref) => {
    const {
      onChange,
      value,
      name = 'snoozeTime',
      label = 'Time',
      selectFirst = false,
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

export default SnoozeTimerPicklist

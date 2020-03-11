import React, { forwardRef, useEffect } from 'react'
import Picklist from 'core/components/Picklist'
import { propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import PropTypes from 'prop-types'

// values match with moment's add/subtract API for use in actions.js
const options = [
  { label: '24 Hours', value: '24.h' },
  { label: '12 Hours', value: '12.h' },
  { label: '6 Hours', value: '6.h' },
  { label: '3 Hours', value: '3.h' },
  { label: '1 Hour', value: '1.h' },
]

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const TimePicklist = forwardRef(
  ({ onChange, selectFirst, ...rest }, ref) => {
    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (selectFirst) {
        onChange(propOr(allKey, 'value', head(options)))
      }
    }, [])

    return (
      <Picklist
        {...rest}
        ref={ref}
        onChange={onChange}
        options={options}
      />
    )
  },
)

TimePicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  selectFirst: PropTypes.bool,
}

TimePicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'time',
  label: 'Time',
  formField: false,
  selectFirst: true,
  showAll: false,
}

export default TimePicklist

import React, { forwardRef, useEffect } from 'react'
import Picklist from 'core/components/Picklist'
import { propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import PropTypes from 'prop-types'

const options = [
  { label: 'warning', value: 'warning' },
  { label: 'critical', value: 'critical' },
  { label: 'fatal', value: 'fatal' },
]

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const SeverityPicklist = forwardRef(
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

SeverityPicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  selectFirst: PropTypes.bool,
}

SeverityPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'severity',
  label: 'Severity',
  formField: false,
  selectFirst: true,
  showAll: true,
}

export default SeverityPicklist

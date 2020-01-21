import React, { forwardRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { head } from 'ramda'
import Picklist from 'core/components/Picklist'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const DetachStatePicklist = forwardRef(
  ({ loading, onChange, selectFirst, ...rest }: any, ref) => {
    const options = [
      { label: 'In Use', value: 'inUse' },
      { label: 'Available', value: 'available' },
    ]

    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (selectFirst) {
        onChange(head(options))
      }
    }, [])

    return <Picklist
      {...rest}
      ref={ref}
      onChange={onChange}
      loading={loading}
      options={options}
    />
  })

DetachStatePicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  selectFirst: PropTypes.bool,
}

DetachStatePicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'availability',
  label: 'Availability',
  formField: false,
  showAll: true,
  selectFirst: false,
}

export default DetachStatePicklist

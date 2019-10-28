import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const StorageTypePicklist = forwardRef((props, ref) => {
  const options = [
    { label: 'gp2', value: 'gp2' },
    { label: 'io1', value: 'io1' },
    { label: 'sc1', value: 'sc1' },
    { label: 'st1', value: 'st1' },
  ]

  return <Picklist
    {...props}
    ref={ref}
    options={options}
  />
})

StorageTypePicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
}

StorageTypePicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'storageType',
  label: 'Storage Type',
  formField: false,
}

export default StorageTypePicklist

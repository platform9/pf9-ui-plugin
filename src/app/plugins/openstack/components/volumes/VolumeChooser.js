import React from 'react'
import PropTypes from 'prop-types'
import ListTableSelect from 'core/common/list_table/ListTableSelect'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'description', label: 'Description' },
  { id: 'size', label: 'Capacity' },
  { id: 'bootable', label: 'Bootable' },
]

const VolumeChooser = ({ data, onChange, initialValue }) => {
  if (!data) { return null }
  return (
    <ListTableSelect
      columns={columns}
      data={data}
      onChange={value => onChange(value.id)}
      initialValue={initialValue && data.find(x => x.id === initialValue)}
    />
  )
}

VolumeChooser.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  initialValue: PropTypes.string,
}

export default VolumeChooser

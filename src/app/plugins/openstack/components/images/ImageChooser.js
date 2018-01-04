import React from 'react'
import PropTypes from 'prop-types'
import ListTableSelect from 'core/components/listTable/ListTableSelect'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'pf9_description', label: 'Description' },
  { id: 'disk_format', label: 'Disk Format' },
  { id: 'virtual_size', label: 'Virtual Disk Size' },
]

const ImageChooser = ({ data, onChange, initialValue }) => {
  if (!data) { return null }
  return (
    <div>
      <ListTableSelect
        columns={columns}
        data={data}
        onChange={value => onChange(value.id)}
        initialValue={initialValue && data.find(x => x.id === initialValue)}
      />
    </div>
  )
}

ImageChooser.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  initialValue: PropTypes.string,
}

export default ImageChooser

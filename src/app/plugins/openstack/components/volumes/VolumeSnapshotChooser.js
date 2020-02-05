import React from 'react'
import PropTypes from 'prop-types'
import ListTableSelect from 'core/components/listTable/ListTableSelect'
import { columns } from './VolumeSnapshotsListContainer'

const VolumeSnapshotChooser = ({ data, onChange, initialValue }) => {
  if (!data) {
    return null
  }
  return (
    <div>
      <ListTableSelect
        columns={columns}
        data={data}
        onChange={(value) => onChange(value.id)}
        initialValue={initialValue && data.find((x) => x.id === initialValue)}
      />
    </div>
  )
}

VolumeSnapshotChooser.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  initialValue: PropTypes.string,
}

export default VolumeSnapshotChooser

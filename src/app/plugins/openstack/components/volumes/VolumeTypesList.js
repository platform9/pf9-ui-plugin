import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  { id: 'is_public', label: 'Public?' },
  { id: 'volume_backend_name', label: 'Volume Backend' },
  { id: 'extra_specs', label: 'Metadata' },
]

class VolumeTypesList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, volumeTypes } = this.props
    if (!volumeTypes || volumeTypes.length === 0) {
      return <h1>No volume types found.</h1>
    }
    return (
      <ListTable
        title="Volume Types"
        columns={columns}
        data={volumeTypes}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        actions={['delete']}
        searchTarget="name"
      />
    )
  }
}

VolumeTypesList.propTypes = {
  /** List of volumeTypes [{ id, name... }] */
  volumeTypes: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a volume row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,
}

VolumeTypesList.defaultProps = {
  volumeTypes: [],
}

export default VolumeTypesList

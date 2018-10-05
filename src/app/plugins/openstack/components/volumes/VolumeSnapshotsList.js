import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

export const columns = [
  { id: 'id', label: 'OpenStack ID' },
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  { id: 'status', label: 'Status' },
  { id: 'source', label: 'Source' },
  { id: 'size', label: 'Capacity' },
  { id: 'created_at', label: 'Created' },
  { id: 'tenant', label: 'Tenant' },
]

class VolumeSnapshotsList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, volumeSnapshots } = this.props

    if (!volumeSnapshots || volumeSnapshots.length === 0) {
      return <h1>No volume snapshots found.</h1>
    }

    return (
      <ListTable
        title="Volume Snapshots"
        columns={columns}
        data={volumeSnapshots}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        searchTarget="name"
      />
    )
  }
}

VolumeSnapshotsList.propTypes = {
  /** List of volumeSnapshots [{ id, name... }] */
  volumeSnapshots: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a volume row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,
}

VolumeSnapshotsList.defaultProps = {
  volumeSnapshots: [],
}

export default VolumeSnapshotsList

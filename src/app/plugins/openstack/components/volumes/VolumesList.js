import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/list_table/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'volume_type', label: 'Volume Type' },
  { id: 'description', label: 'Description' },
  { id: 'status', label: 'Status' },
  { id: 'tenant', label: 'Tenant' },
  { id: 'source', label: 'Source' },
  { id: 'host', label: 'Host' },
  { id: 'instance', label: 'Instance' },
  { id: 'device', label: 'Device' },
  { id: 'size', label: 'Capacity' },
  { id: 'bootable', label: 'Bootable' },
  { id: 'created_at', label: 'Created' },
  { id: 'id', label: 'OpenStack ID' },
  { id: 'attachedMode', label: 'attached_mode' },
  { id: 'readonly', label: 'readonly' },

  // TODO: We probably want to write a metadata renderer for this kind of format
  // since we use it in a few places for tags / metadata.
  { id: 'metadata', label: 'Metadata', render: data => JSON.stringify(data) }
]

class VolumesList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, rowActions, volumes } = this.props
    if (!volumes || volumes.length === 0) {
      return <h1>No volumes found.</h1>
    }

    return (
      <ListTable
        title="Volumes"
        columns={columns}
        data={volumes}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        rowActions={rowActions}
        searchTarget="name"
      />
    )
  }
}

VolumesList.propTypes = {
  /** List of volumes [{ id, name... }] */
  volumes: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a volume row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,

  rowActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func,
      icon: PropTypes.node,
    })
  ),
}

VolumesList.defaultProps = {
  volumes: [],
}

export default VolumesList

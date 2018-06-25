import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'id', label: 'OpenStack ID' },
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  { id: 'status', label: 'Status' },
  { id: 'owner', label: 'Tenant' },
  { id: 'visibility', label: 'Visibility' },
  { id: 'protected', label: 'Protected' },
  { id: 'disk_format', label: 'Disk Format' },
  { id: 'virtual_size', label: 'Virtual Disk Size' },
  { id: 'size', label: 'File Size' },
  { id: 'created_at', label: 'Created' }
]

class GlanceImageList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, glanceImages } = this.props
    if (!glanceImages || glanceImages.length === 0) {
      return <h1>No Glance Images Found.</h1>
    }
    return (
      <ListTable
        title="Glance Images"
        columns={columns}
        data={glanceImages}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        actions={['delete']}
      />
    )
  }
}

GlanceImageList.propTypes = {
  /** List of glance images [{ id, name... }] */
  glanceImages: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a glance image row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired
}

GlanceImageList.defaultProps = {
  glanceImages: [],
}

export default GlanceImageList

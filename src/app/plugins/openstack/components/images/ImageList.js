import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/list_table/ListTable'

const columns = [
  { id: 'id', label: 'OpenStack ID' },
  { id: 'name', label: 'Name' },
  { id: 'pf9_description', label: 'Description' },
  { id: 'status', label: 'Status' },
  { id: 'owner', label: 'Tenant' },
  { id: 'visibility', label: 'Visibility' },
  { id: 'protected', label: 'Protected' },
  { id: 'disk_format', label: 'Disk Format' },
  { id: 'virtual_size', label: 'Virtual Disk Size' },
  { id: 'size', label: 'File Size' },
  { id: 'created_at', label: 'Created' }
]

class ImageList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, images } = this.props
    if (!images || images.length === 0) {
      return <h1>No Images Found.</h1>
    }
    return (
      <ListTable
        title="Images"
        columns={columns}
        data={images}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        searchTarget="name"
      />
    )
  }
}

ImageList.propTypes = {
  /** List of  images [{ id, name... }] */
  images: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a  image row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired
}

ImageList.defaultProps = {
  images: [],
}

export default ImageList

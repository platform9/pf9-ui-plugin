import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import CRUDListContainer from 'core/components/CRUDListContainer'
import createListTableComponent from 'core/helpers/createListTableComponent'

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

export const ImageList = createListTableComponent({
  title: 'Images',
  emptyText: 'No images found.',
  name: 'ImagesList',
  columns,
})

class ImageListContainer extends React.Component {
  handleRemove = async id => {
    const { images, setContext, context } = this.props
    const { glance } = context.apiClient
    await glance.deleteImage(id)
    const newImages = images.filter(x => x.id !== id)
    setContext({ images: newImages })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.images}
        addUrl="/ui/openstack/images/add"
        editUrl="/ui/openstack/images/edit"
        onRemove={this.handleRemove}
      >
        {handlers => <ImageList data={this.props.images} {...handlers} />}
      </CRUDListContainer>
    )
  }
}

ImageListContainer.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
)(ImageListContainer)

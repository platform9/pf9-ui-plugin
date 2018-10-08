import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import ImageList from './ImageList'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'

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
        {handlers => <ImageList images={this.props.images} {...handlers} />}
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

import React from 'react'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'
import GlanceImageList from './GlanceImageList'
import { GET_GLANCEIMAGES, REMOVE_GLANCEIMAGE } from './actions'

class GlanceImageContainer extends React.Component {
  handleRemove = async id => {
    const { client } = this.props
    client.mutate({
      mutation: REMOVE_GLANCEIMAGE,
      variables: { id },
      update: cache => {
        const data = cache.readQuery({ query: GET_GLANCEIMAGES })
        data.glanceImages = data.glanceImages.filter(x => x.id !== id)
        cache.writeQuery({ query: GET_GLANCEIMAGES, data })
      }
    })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.glanceImages}
        onRemove={this.handleRemove}
        addUrl="/ui/openstack/glanceimages/add"
      >
        {({ onDelete, onAdd }) => (
          <GlanceImageList
            glanceImages={this.props.glanceImages}
            onAdd={onAdd}
            onDelete={onDelete}
          />
        )}
      </CRUDListContainer>
    )
  }
}

GlanceImageContainer.propTypes = {
  glanceImages: PropTypes.arrayOf(PropTypes.object)
}

export default withApollo(GlanceImageContainer)

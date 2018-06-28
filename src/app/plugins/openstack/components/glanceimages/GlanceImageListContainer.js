import React from 'react'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'
import GlanceImageList from './GlanceImageList'
import { GET_GLANCEIMAGES, REMOVE_GLANCEIMAGE } from './actions'

class GlanceImageContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.glanceImages}
        str="glanceImages"
        client={this.props.client}
        getQuery={GET_GLANCEIMAGES}
        removeQuery={REMOVE_GLANCEIMAGE}
        addUrl="/ui/openstack/glanceimages/add"
        editUrl="/ui/openstack/glanceimages/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <GlanceImageList
            glanceImages={this.props.glanceImages}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
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

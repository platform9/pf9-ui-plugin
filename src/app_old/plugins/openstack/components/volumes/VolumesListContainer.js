import React from 'react'
import PropTypes from 'prop-types'

import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'

import VolumesList from './VolumesList'
import { GET_VOLUMES, REMOVE_VOLUME } from './actions'

class VolumesListContainer extends React.Component {
  handleRemove = async id => {
    const { client } = this.props
    client.mutate({
      mutation: REMOVE_VOLUME,
      variables: { id },
      update: cache => {
        const data = cache.readQuery({ query: GET_VOLUMES })
        data.users = data.users.filter(x => x.id !== id)
        cache.writeQuery({ query: GET_VOLUMES, data })
      }
    })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.volumes}
        onRemove={this.handleRemove}
        addUrl="/ui/openstack/volumes/add"
      >
        {({ onDelete, onAdd }) => (
          <VolumesList
            volumes={this.props.volumes}
            onAdd={onAdd}
            onDelete={onDelete}
          />
        )}
      </CRUDListContainer>
    )
  }
}

VolumesListContainer.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.object)
}

export default withApollo(VolumesListContainer)

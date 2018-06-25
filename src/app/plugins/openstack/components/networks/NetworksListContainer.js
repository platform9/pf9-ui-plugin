import React from 'react'
import PropTypes from 'prop-types'

import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'

import NetworksList from './NetworksList'
import { GET_NETWORKS, REMOVE_NETWORK } from './actions'

class NetworksListContainer extends React.Component {
  handleRemove = async id => {
    const { client } = this.props
    client.mutate({
      mutation: REMOVE_NETWORK,
      variables: { id },
      update: cache => {
        const data = cache.readQuery({ query: GET_NETWORKS })
        data.networks = data.networks.filter(x => x.id !== id)
        cache.writeQuery({ query: GET_NETWORKS, data })
      }
    })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.networks}
        onRemove={this.handleRemove}
        addUrl="/ui/openstack/networks/add"
        editUrl="/ui/openstack/networks/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <NetworksList
            networks={this.props.networks}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

NetworksListContainer.propTypes = {
  networks: PropTypes.arrayOf(PropTypes.object)
}

export default withApollo(NetworksListContainer)

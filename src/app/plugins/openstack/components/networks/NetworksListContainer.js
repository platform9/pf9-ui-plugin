import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import NetworksList from './NetworksList'
import { GET_NETWORKS, REMOVE_NETWORK } from './actions'

class NetworksListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.networks}
        objType="networks"
        getQuery={GET_NETWORKS}
        removeQuery={REMOVE_NETWORK}
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

export default NetworksListContainer

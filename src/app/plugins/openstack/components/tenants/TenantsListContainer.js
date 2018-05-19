import React from 'react'
import PropTypes from 'prop-types'

import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'

import TenantsList from './TenantsList'
import { GET_TENANTS, REMOVE_TENANT } from './actions'

class TenantsListContainer extends React.Component {
  handleRemove = async id => {
    const { client } = this.props
    client.mutate({
      mutation: REMOVE_TENANT,
      variables: { id },
      update: cache => {
        const data = cache.readQuery({ query: GET_TENANTS })
        data.tenants = data.tenants.filter(x => x.id !== id)
        cache.writeQuery({ query: GET_TENANTS, data })
      }
    })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.tenants}
        onRemove={this.handleRemove}
        addUrl="/ui/openstack/tenants/add"
      >
        {({ onDelete, onAdd }) => (
          <TenantsList
            tenants={this.props.tenants}
            onAdd={onAdd}
            onDelete={onDelete}
          />
        )}
      </CRUDListContainer>
    )
  }
}

TenantsListContainer.propTypes = {
  tenants: PropTypes.arrayOf(PropTypes.object)
}

export default withApollo(TenantsListContainer)

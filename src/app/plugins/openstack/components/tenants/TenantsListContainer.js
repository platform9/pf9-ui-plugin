import React from 'react'
import PropTypes from 'prop-types'

import CRUDListContainer from 'core/common/CRUDListContainer'

import TenantsList from './TenantsList'

class TenantsListContainer extends React.Component {
  handleRemove = (id) => {
    console.log(`Attempting to remove ${id}`)
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

export default TenantsListContainer

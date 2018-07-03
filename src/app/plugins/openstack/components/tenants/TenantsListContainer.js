import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import TenantsList from './TenantsList'
import { GET_TENANTS, REMOVE_TENANT } from './actions'

class TenantsListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.tenants}
        objType="tenants"
        getQuery={GET_TENANTS}
        removeQuery={REMOVE_TENANT}
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

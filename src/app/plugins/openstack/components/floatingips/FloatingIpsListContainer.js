import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import FloatingIpsList from './FloatingIpsList'
import { GET_FLOATING_IPS, REMOVE_FLOATING_IP } from './actions'

class FloatingIpsListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.floatingIps}
        objType="floatingIps"
        getQuery={GET_FLOATING_IPS}
        removeQuery={REMOVE_FLOATING_IP}
        addUrl="/ui/openstack/floatingips/add"
        editUrl="/ui/openstack/floatingips/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <FloatingIpsList
            floatingIps={this.props.floatingIps}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

FloatingIpsListContainer.propTypes = {
  floatingIps: PropTypes.arrayOf(PropTypes.object)
}

export default FloatingIpsListContainer

/* eslint-disable camelcase */
import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import HostsList from './HostsList'

class HostsListContainer extends React.Component {
  render () {
    const hosts = this.props.hosts || []
    return (
      <CRUDListContainer
        items={hosts}
        addUrl="/ui/openstack/hosts/add"
        editUrl="/ui/openstack/hosts/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <HostsList
            hosts={hosts}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

HostsListContainer.propTypes = {
  hosts: PropTypes.arrayOf(PropTypes.object)
}

export default HostsListContainer

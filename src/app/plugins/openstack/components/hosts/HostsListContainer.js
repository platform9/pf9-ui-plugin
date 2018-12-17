/* eslint-disable camelcase */
import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import createListTableComponent from 'core/helpers/createListTableComponent'

const columns = [
  { id: 'hypervisor_hostname', label: 'Hostname' },
  { id: 'status', label: 'Status' },
  { id: 'host_ip', label: 'Host IP' }
]

export const HostsList = createListTableComponent({
  title: 'Hosts',
  emptyText: 'No hosts found.',
  name: 'HostsList',
  columns,
  searchTarget: 'hypervisor_hostname',
})

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

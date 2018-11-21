import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/list_table/ListTable'

const columns = [
  { id: 'hypervisor_hostname', label: 'Hostname' },
  { id: 'status', label: 'Status' },
  { id: 'host_ip', label: 'Host IP' }
]

class HostsList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, hosts } = this.props
    if (!hosts || hosts.length === 0) {
      return <h1>No hosts found.</h1>
    }
    return (
      <ListTable
        title="Hosts"
        columns={columns}
        data={hosts}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        searchTarget="hypervisor_hostname"
      />
    )
  }
}

HostsList.propTypes = {
  /** List of hosts [{ id, name... }] */
  hosts: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,
}

HostsList.defaultProps = {
  hosts: [],
}

export default HostsList

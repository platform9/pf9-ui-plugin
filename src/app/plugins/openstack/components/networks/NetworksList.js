import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'subnets', label: 'Subnets Associated' },
  { id: 'tenant', label: 'Tenant' },
  { id: 'shared', label: 'Shared' },
  { id: 'port_security_enabled', label: 'Port Security' },
  { id: 'external', label: 'External Network' },
  { id: 'admin_state_up', label: 'Admin State' },
  { id: 'status', label: 'Status' },
]

class NetworksList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, networks } = this.props

    if (!networks || networks.length === 0) {
      return (<h1>No networks found</h1>)
    }

    return (
      <ListTable
        title="Networks"
        columns={columns}
        data={networks}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        actions={['delete']}
      />
    )
  }
}

NetworksList.propTypes = {
  /** List of networks [{ name, cidr, tenant, ... }] */
  networks: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a network row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired
}

NetworksList.defaultProps = {
  networks: [],
}

export default NetworksList

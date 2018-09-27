import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'floating_ip_address', label: 'Floating IP' },
  { id: 'subnet_id', label: 'Subnet ID' },
  { id: 'tenant_id', label: 'Tenant ID' },
  { id: 'fixed_ip_address', label: 'Fixed IP' },
  { id: 'description', label: 'Description' },
  { id: 'floating_network_id', label: 'Floating Network ID' },
  { id: 'status', label: 'Status' },
  { id: 'router_id', label: 'Router ID' },
]

// TODO: There should be a special sort function for ip addresses

class FloatingIpsList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, floatingIps } = this.props

    if (!floatingIps || floatingIps.length === 0) {
      return (<h1>No Floating IPs found</h1>)
    }

    return (
      <ListTable
        title="Floating IPs"
        columns={columns}
        data={floatingIps}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        searchTarget="name"
      />
    )
  }
}

FloatingIpsList.propTypes = {
  /** List of floating IPs [{ floating_ip_address, tenant_id, ... }] */
  floatingIps: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired
}

FloatingIpsList.defaultProps = {
  floatingIps: [],
}

export default FloatingIpsList

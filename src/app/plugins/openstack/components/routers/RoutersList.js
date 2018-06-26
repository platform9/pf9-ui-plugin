import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'tenant_id', label: 'Tenant' },
  { id: 'admin_state_up', label: 'Admin State' },
  { id: 'status', label: 'Status' },
]

class RoutersList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, routers } = this.props

    if (!routers || routers.length === 0) {
      return (<h1>No routers found</h1>)
    }

    return (
      <ListTable
        title="Routers"
        columns={columns}
        data={routers}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        actions={['delete']}
      />
    )
  }
}

RoutersList.propTypes = {
  /** List of routers [{ name, cidr, tenant, ... }] */
  routers: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a network row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired
}

RoutersList.defaultProps = {
  routers: [],
}

export default RoutersList

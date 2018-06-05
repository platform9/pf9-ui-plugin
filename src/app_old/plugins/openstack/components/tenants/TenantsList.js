import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  { id: 'computeUsage', label: 'Compute usage' },
  { id: 'blockStorageUsage', label: 'Block storage usage' },
  { id: 'networkUsage', label: 'Network usage' },
]

class TenantsList extends React.Component {
  render () {
    const { onAdd, onDelete, tenants } = this.props

    if (!tenants || tenants.length === 0) {
      return (<h1>No tenants found</h1>)
    }

    return (
      <ListTable
        title="Tenants"
        columns={columns}
        data={tenants}
        onAdd={onAdd}
        onDelete={onDelete}
        actions={['delete']}
      />
    )
  }
}

TenantsList.propTypes = {
  /** List of tenants [{ name, displayname, tenants, ... }] */
  tenants: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a tenant row */
  onDelete: PropTypes.func.isRequired,
}

TenantsList.defaultProps = {
  tenants: [],
}

export default TenantsList

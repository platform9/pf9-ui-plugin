import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'author', label: 'Author' },
  { id: 'tenant', label: 'Tenant' },
  { id: 'public', label: 'Public' },
  { id: 'description', label: 'Description' }
]

class ApplicationsList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, applications } = this.props

    if (!applications || applications.length === 0) {
      return (<h1>No applications found</h1>)
    }

    return (
      <ListTable
        title="Applications"
        columns={columns}
        data={applications}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        actions={['delete']}
        searchTarget="name"
      />
    )
  }
}

ApplicationsList.propTypes = {
  applications: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
}

ApplicationsList.defaultProps = {
  applications: []
}

export default ApplicationsList

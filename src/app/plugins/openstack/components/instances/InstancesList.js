import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'state', label: 'State' }
]

class InstancesList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, instances } = this.props
    if (!instances || instances.length === 0) {
      return <h1>No instances found.</h1>
    }
    return (
      <ListTable
        title="Instances"
        columns={columns}
        data={instances}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        actions={['delete']}
        searchTarget="name"
      />
    )
  }
}

InstancesList.propTypes = {
  /** List of instances [{ id, name... }] */
  instances: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,
}

InstancesList.defaultProps = {
  instances: [],
}

export default InstancesList

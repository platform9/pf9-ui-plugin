import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
]

class ClustersList extends React.Component {
  render () {
    const { onAdd, onDelete, clusters } = this.props

    if (!clusters || clusters.length === 0) {
      return (<h1>No clusters found</h1>)
    }

    return (
      <ListTable
        title="Clusters"
        columns={columns}
        data={clusters}
        onAdd={onAdd}
        onDelete={onDelete}
        actions={['delete']}
      />
    )
  }
}

ClustersList.propTypes = {
  /** List of clusters [{ name, displayname, tenants, ... }] */
  clusters: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a cluster row */
  onDelete: PropTypes.func.isRequired,
}

ClustersList.defaultProps = {
  clusters: [],
}

export default ClustersList

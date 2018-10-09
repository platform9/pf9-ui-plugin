import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Cluster name' },
  { id: 'status', label: 'Status' },
  { id: 'links', label: 'Links' },
  { id: 'deployment_type', label: 'Deployment Type' },
  { id: 'resource_utilization', label: 'Resource Utilization' },
  { id: 'version', label: 'Kubernetes version' },
  { id: 'network_backend', label: 'Network backend' },
  { id: 'containers_cidr', label: 'Containers CIDR' },
  { id: 'services_cidr', label: 'Services CIDR' },
  { id: 'api_endpoint', label: 'API endpoint' },
  { id: 'cloud_provider', label: 'Cloud provider' },
  { id: 'nodes', label: 'Nodes' },
  { id: 'master_workloads', label: 'Master Workloads' },
  { id: 'privileged', label: 'Privileged' },

  // TODO: We probably want to write a metadata renderer for this kind of format
  // since we use it in a few places for tags / metadata.
  { id: 'metadata', label: 'Metadata', render: data => JSON.stringify(data) }
]

class ClustersList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, rowActions, data } = this.props
    if (!data || data.length === 0) {
      return <h1>No clusters found.</h1>
    }

    return (
      <ListTable
        title="Clusters"
        columns={columns}
        data={data}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        rowActions={rowActions}
        searchTarget="name"
        uniqueIdentifier="uuid"
      />
    )
  }
}

ClustersList.propTypes = {
  /** List of clusters */
  data: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a volume row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,

  rowActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func,
      icon: PropTypes.node,
    })
  ),
}

ClustersList.defaultProps = {
  data: [],
}

export default ClustersList

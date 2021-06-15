import React, { useMemo } from 'react'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { ImportedClusterSelector } from './model'

const renderLocations = (locations) => <span>{locations.join(', ')}</span>

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'nodeCount', label: 'Number of Nodes' },
  { id: 'machineType', label: 'Instance Type' },
  { id: 'diskSizeGb', label: 'OS Disk Size' },
  { id: 'diskType', label: 'OS Disk Type' },
  { id: 'maxPodsPerNode', label: 'Max Pods' },
  { id: 'locations', label: 'Locations', render: renderLocations },
  { id: 'status', label: 'Status' },
  { id: 'k8sVersion', label: 'Kubernetes Version' },
  { id: 'imageType', label: 'Instance Image' },
]

interface Props {
  cluster: ImportedClusterSelector
  loading: boolean
  reload: any
}
const GKENodeGroups = ({ cluster, loading, reload }: Props) => {
  const { nodeGroups } = cluster
  const GKENodeGroupsTable = useMemo(
    () =>
      createListTableComponent({
        title: 'Node Groups',
        name: 'node-groups',
        columns,
        onReload: reload,
        emptyText: 'Nothing yet, waiting for node groups...',
        uniqueIdentifier: 'name',
        showCheckboxes: true, // Should this be false? Or is the extra spacing nice to have?
        multiSelection: false,
      }),
    [reload],
  )

  return <GKENodeGroupsTable data={nodeGroups} loading={loading} />
}

export default GKENodeGroups

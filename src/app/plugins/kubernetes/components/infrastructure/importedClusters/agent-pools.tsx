import React, { useMemo } from 'react'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { ImportedClusterSelector } from './model'

const renderAZs = (azs) => <span>{azs.join(', ')}</span>

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'count', label: 'Number of Nodes' },
  { id: 'vmSize', label: 'Instance Type' },
  { id: 'osDiskSizeGB', label: 'OS Disk Size' },
  { id: 'osDiskType', label: 'OS Disk Type' },
  { id: 'maxPods', label: 'Max Pods' },
  { id: 'type', label: 'Node Pool Type' },
  { id: 'availabilityZones', label: 'Availability Zones', render: renderAZs },
  { id: 'provisioningState', label: 'Provisioning State' },
  { id: 'powerState', label: 'Power State' },
  { id: 'kubernetesVersion', label: 'Kubernetes Version' },
  { id: 'mode', label: 'Mode' },
  { id: 'osType', label: 'OS Type' },
  { id: 'nodeImageVersion', label: 'Instance Image Versions' },
]

interface Props {
  cluster: ImportedClusterSelector
  loading: boolean
  reload: any
}
const AgentPools = ({ cluster, loading, reload }: Props) => {
  // Listed as node groups but in Azure these are termed Agent Pools
  const { nodeGroups } = cluster
  const AgentPoolsTable = useMemo(
    () =>
      createListTableComponent({
        title: 'Agent Pools',
        name: 'agent-pools',
        columns,
        onReload: reload,
        emptyText: 'Nothing yet, waiting for agent pools...',
        uniqueIdentifier: 'name',
        showCheckboxes: true, // Should this be false? Or is the extra spacing nice to have?
        multiSelection: false,
      }),
    [reload],
  )

  return <AgentPoolsTable data={nodeGroups} loading={loading} />
}

export default AgentPools

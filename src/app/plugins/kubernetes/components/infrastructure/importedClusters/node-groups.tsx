import React, { useMemo } from 'react'
import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { ImportedClusterSelector } from './model'
import Text from 'core/elements/text'

const renderSubnets = (subnets = []) => <span>{subnets.length}</span>
const renderNumberOfNodes = (instances = []) => <span>{`Nodes ${instances.length}`}</span>
const renderInstanceTypes = (instanceTypes = []) =>
  instanceTypes.map((instance) => <div>{instance}</div>)
const renderScalingConfig = (scalingConfig: any = {}) => (
  <div>
    <div>Min {scalingConfig?.minSize}</div>
    <div>Max {scalingConfig?.maxSize}</div>
    <div>Desired {scalingConfig?.desiredSize}</div>
  </div>
)
const renderFormattedName = (name) => (
  <Text variant="body2" className="capitalize">
    {name
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .toLowerCase()}
  </Text>
)

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'instances', label: 'Number of Nodes', render: renderNumberOfNodes },
  { id: 'capacityType', label: 'Capacity Type', render: renderFormattedName },
  { id: 'status', label: 'Status', render: renderFormattedName },
  { id: 'instanceTypes', label: 'Instance Types', render: renderInstanceTypes },
  { id: 'scalingConfig', label: 'Autoscaling', render: renderScalingConfig },
  { id: 'kubernetesVersion', label: 'Kubernetes Version' },
  { id: 'subnets', label: 'Subnets', render: renderSubnets },
  { id: 'createdAt', label: 'Created', render: (value) => <DateAndTime value={value} /> },
]
interface Props {
  cluster: ImportedClusterSelector
  loading: boolean
  reload: any
}
const NodeGroups = ({ cluster, loading, reload }: Props) => {
  const { nodeGroups } = cluster
  const NodeGroupsTable = useMemo(
    () =>
      createListTableComponent({
        title: 'Node Groups',
        name: 'node-groups',
        columns,
        onReload: reload,
        emptyText: 'Nothing yet, waiting for node groups...',
        uniqueIdentifier: 'name',
        showCheckboxes: true,
        multiSelection: false,
      }),
    [reload],
  )

  return <NodeGroupsTable data={nodeGroups} loading={loading} />
}

export default NodeGroups

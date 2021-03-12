import React, { useMemo } from 'react'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { flatten, map, pipe } from 'ramda'
import { ImportedClusterSelector, Instance, Nodegroup } from './model'
import ExternalLink from 'core/components/ExternalLink'

const columns = [
  { id: 'groupName', label: 'Node Group' },
  { id: 'instanceId', label: 'Instance ID' },
  { id: 'availabilityZone', label: 'Availability Zone' },
  { id: 'instanceType', label: 'Instance Type' },
  { id: 'network.vpcId', label: 'VPC ID' },
  { id: 'network.publicIpAddress', label: 'Public Ip' },
  { id: 'network.privateIpAddress', label: 'Private Ip' },
  {
    id: 'network.publicDnsName',
    label: 'Public DNS Name',
    render: (value) => <ExternalLink url={`https://${value}`}>{value}</ExternalLink>,
  },
]

interface Props {
  cluster: ImportedClusterSelector
  loading: boolean
  reload: any
}
const Nodes = ({ cluster, loading, reload }: Props) => {
  const { nodeGroups } = cluster
  const nodes = pipe<Nodegroup[], Instance[][], Instance[]>(
    map((nodeGroup) =>
      nodeGroup?.instances?.map((instance) => ({ ...instance, groupName: nodeGroup?.name })),
    ),
    flatten,
  )(nodeGroups)

  const NodesTable = useMemo(
    () =>
      createListTableComponent({
        title: 'Nodes',
        name: 'nodes',
        columns,
        onReload: reload,
        emptyText: 'Nothing yet, waiting for nodes...',
        uniqueIdentifier: 'instanceId',
        showCheckboxes: true,
        multiSelection: false,
      }),
    [reload],
  )

  return <NodesTable data={nodes} loading={loading} />
}

export default Nodes

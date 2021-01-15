import React, { useState } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import SimpleLink from 'core/components/SimpleLink'
import { ActionDataKeys } from 'k8s/DataKeys'
import ResourceUsageTables from '../common/ResourceUsageTables'
import { routes } from 'core/utils/routes'

const toMHz = (bytes) => bytes / Math.pow(1024, 2)
const toGB = (bytes) => bytes / Math.pow(1024, 3)
const renderDeployedCapacity = (_, { deployedCapacity }) => (
  <ResourceUsageTables usage={deployedCapacity} />
)
const renderClusterLink = ({ uuid, name }) => (
  <div key={uuid}>
    <SimpleLink src={`/ui/kubernetes/infrastructure/clusters/${uuid}`}>{name}</SimpleLink>
  </div>
)
const ClustersCell = ({ clusters }) => {
  if (!clusters || !clusters.length) {
    return <div>0</div>
  }
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      {expanded ? (
        <div>
          {clusters.map(renderClusterLink)}
          <SimpleLink onClick={() => setExpanded(!expanded)}>(less details)</SimpleLink>
        </div>
      ) : (
        <div>
          {clusters.length}&nbsp;
          <SimpleLink onClick={() => setExpanded(!expanded)}>(more details)</SimpleLink>
        </div>
      )}
    </div>
  )
}
const renderNodeLink = ({ uuid, name }) => (
  <div key={uuid}>
    <SimpleLink src={`/ui/kubernetes/infrastructure/nodes/${uuid}`}>{name}</SimpleLink>
  </div>
)
const NodesCell = ({ nodes }) => {
  if (!nodes || !nodes.length) {
    return <div>0</div>
  }
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      {expanded ? (
        <div>
          {nodes.map(renderNodeLink)}
          <SimpleLink onClick={() => setExpanded(!expanded)}>(less details)</SimpleLink>
        </div>
      ) : (
        <div>
          {nodes.length}&nbsp;
          <SimpleLink onClick={() => setExpanded(!expanded)}>(more details)</SimpleLink>
        </div>
      )}
    </div>
  )
}

export const options = {
  addUrl: routes.cloudProviders.add.path(),
  addText: 'Add Cloud Provider',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'descriptiveType', label: 'Type' },
    { id: 'deployedCapacity', label: 'Deployed Capacity', render: renderDeployedCapacity },
    {
      id: 'clusters',
      label: 'Clusters',
      render: (clusters) => <ClustersCell clusters={clusters} />,
    },
    { id: 'nodes', label: 'Nodes', render: (nodes) => <NodesCell nodes={nodes} /> },
    { id: 'uuid', label: 'Unique ID' },
  ],
  cacheKey: ActionDataKeys.CloudProviders,
  editUrl: (_, id) => routes.cloudProviders.edit.path({ id }),
  editCond: ([selectedRow]) => selectedRow.type !== 'openstack',
  editDisabledInfo: () => 'Editing an Openstack cloud provider is not currently supported',
  deleteCond: ([selectedRow]) => selectedRow.type !== 'local',
  deleteDisabledInfo: () => 'Deleting local cloud provider is not currently supported',
  name: 'CloudProviders',
  rowActions: [],
  title: 'Cloud Providers',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
}

const { ListPage } = createCRUDComponents(options)

export default ListPage

import React from 'react'
import { projectAs } from 'utils/fp'
import Picklist from 'core/components/Picklist'
import { deleteNamespace, loadNamespaces } from 'k8s/components/namespaces/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import clusterizedDataLoader from 'k8s/helpers/clusterizedDataLoader'
import moize from 'moize'

const ListPage = ({ ListContainer }) => {
  const handleClusterChange = moize(setParams => async clusterId => {
    setParams({ clusterId })
  })

  const findClusterName = (clusters, clusterId) => {
    const cluster = clusters.find(x => x.uuid === clusterId)
    return (cluster && cluster.name) || ''
  }

  return clusterizedDataLoader('namespaces', loadNamespaces)(
    ({ setParams, params: { clusterId }, data: { clusters, namespaces } }) =>
      <div>
        <Picklist
          formField={false}
          name="currentCluster"
          label="Current Cluster"
          options={projectAs(
            { label: 'name', value: 'uuid' },
            clusters.filter(x => x.hasMasterNode),
          )}
          value={clusterId}
          onChange={handleClusterChange(setParams)}
        />
        <ListContainer data={namespaces.map(ns => ({
          ...ns,
          clusterName: findClusterName(clusters, ns.clusterId),
        }))} />
      </div>,
  )
}

export const options = {
  addUrl: '/ui/kubernetes/namespaces/add',
  addText: 'Add Namespace',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'namespaces',
  deleteFn: deleteNamespace,
  editUrl: '/ui/kubernetes/namespaces/edit',
  name: 'Namespaces',
  title: 'Namespaces',
  ListPage,
}

const components = createCRUDComponents(options)
export const NodesList = components.List

export default components.ListPage

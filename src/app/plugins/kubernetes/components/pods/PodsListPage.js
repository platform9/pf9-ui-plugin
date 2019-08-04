import React from 'react'
import { projectAs } from 'utils/fp'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { deletePod, loadPods } from 'k8s/components/pods/actions'
import Picklist from 'core/components/Picklist'
import moize from 'moize'
import clusterizedDataLoader from 'k8s/helpers/clusterizedDataLoader'

const ListPage = ({ ListContainer }) => {
  const handleClusterChange = moize(setParams => async clusterId => {
    setParams({ clusterId })
  })

  const findClusterName = (clusters, clusterId) => {
    const cluster = clusters.find(x => x.uuid === clusterId)
    return (cluster && cluster.name) || ''
  }

  return clusterizedDataLoader('pods', loadPods)(
    ({ setParams, params: { clusterId }, data: { clusters, pods } }) =>
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
        <ListContainer data={pods.map(ns => ({
          ...ns,
          clusterName: findClusterName(clusters, ns.clusterId),
        }))} />
      </div>,
  )
}

export const options = {
  addUrl: '/ui/kubernetes/pods/add',
  addText: 'Add Pod',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'pods',
  deleteFn: deletePod,
  name: 'Pods',
  title: 'Pods',
  ListPage,
}
const components = createCRUDComponents(options)
export const PodsList = components.List

export default components.ListPage

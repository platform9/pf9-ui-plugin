import React from 'react'
import { projectAs } from 'utils/fp'
import Picklist from 'core/components/Picklist'
import { loadDeployments } from 'k8s/components/pods/actions'
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

  return clusterizedDataLoader('deployments', loadDeployments)(
    ({ setParams, params: { clusterId }, data: { deployments, clusters } }) =>
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
        <ListContainer data={deployments.map(ns => ({
          ...ns,
          clusterName: findClusterName(clusters, ns.clusterId),
        }))} />
      </div>,
  )
}

export const options = {
  loaderFn: loadDeployments,
  addUrl: '/ui/kubernetes/deployments/add',
  addText: 'Add Deployment',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'deployments',
  name: 'Deployments',
  title: 'Deployments',
  ListPage,
}
const components = createCRUDComponents(options)
export const DeploymentsList = components.List

export default components.ListPage

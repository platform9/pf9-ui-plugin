import React from 'react'
import Picklist from 'core/components/Picklist'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { deleteService } from './actions'
import { projectAs } from 'utils/fp'
import { loadServices } from 'k8s/components/pods/actions'
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

  return clusterizedDataLoader('kubeServices', loadServices)(
    ({ setParams, params: { clusterId }, data: { clusters, kubeServices } }) =>
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
        <ListContainer data={kubeServices.map(ns => ({
          ...ns,
          clusterName: findClusterName(clusters, ns.clusterId),
        }))} />
      </div>,
  )
}

export const options = {
  addUrl: '/ui/kubernetes/services/add',
  addText: 'Add Service',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'kubeServices',
  deleteFn: deleteService,
  name: 'Services',
  title: 'Services',
  ListPage,
}
const components = createCRUDComponents(options)
export const ServicesList = components.List

export default components.ListPage

import React, { useState, useCallback } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { podActions } from 'k8s/components/pods/actions'

const defaultParams = {
  masterNodeClusters: true,
}
const ListPage = ({ ListContainer }) => {
  return () => {
    const [params, setParams] = useState(defaultParams)
    const handleClusterChange = useCallback(clusterId => {
      setParams({ ...params, clusterId })
    }, [])
    const [data, loading, reload] = useDataLoader(podActions.list, params)

    return <div>
      <ClusterPicklist
        onChange={handleClusterChange}
        value={params.clusterId}
      />
      <ListContainer loading={loading} reload={reload} data={data} />
    </div>
  }
}

export const options = {
  addUrl: '/ui/kubernetes/pods/add',
  addText: 'Add Pod',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  name: 'Pods',
  title: 'Pods',
  ListPage,
}
const components = createCRUDComponents(options)
export const PodsList = components.List

export default components.ListPage

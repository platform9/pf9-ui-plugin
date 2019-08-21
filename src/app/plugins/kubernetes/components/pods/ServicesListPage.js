import React, { useState, useCallback } from 'react'
import { emptyObj } from 'utils/fp'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'

const ListPage = ({ ListContainer }) => {
  return () => {
    const [params, setParams] = useState(emptyObj)
    const handleClusterChange = useCallback(clusterId => setParams({ clusterId }), [])
    const [data, loading, reload] = useDataLoader('kubeServices', params)
    return <div>
      <ClusterPicklist
        formField={false}
        onChange={handleClusterChange}
        value={params.clusterId}
      />
      <ListContainer loading={loading} reload={reload} data={data} />
    </div>
  }
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
  name: 'Services',
  title: 'Services',
  ListPage,
}
const components = createCRUDComponents(options)
export const ServicesList = components.List

export default components.ListPage

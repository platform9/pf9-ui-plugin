import React, { useState, useCallback } from 'react'
import { emptyObj } from 'utils/fp'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { namespacesDataKey } from './actions'

const ListPage = ({ ListContainer }) => {
  return () => {
    const [params, setParams] = useState(emptyObj)
    const handleClusterChange = useCallback(clusterId => setParams({ clusterId }), [setParams])
    const [namespaces, loading, reload] = useDataLoader(namespacesDataKey, params)
    return <div>
      <ClusterPicklist
        onChange={handleClusterChange}
        value={params.clusterId}
      />
      <ListContainer loading={loading} reload={reload} data={namespaces} />
    </div>
  }
}

export const options = {
  addUrl: '/ui/kubernetes/namespaces/add',
  addText: 'Add Namespace',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: namespacesDataKey,
  editUrl: '/ui/kubernetes/namespaces/edit',
  name: 'Namespaces',
  title: 'Namespaces',
  ListPage,
}

const components = createCRUDComponents(options)
export const NodesList = components.List

export default components.ListPage

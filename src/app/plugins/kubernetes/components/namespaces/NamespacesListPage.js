import React, { useState, useCallback } from 'react'
import { emptyObj } from 'utils/fp'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import { deleteNamespace } from 'k8s/components/namespaces/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import useDataLoader from 'core/hooks/useDataLoader'

const ListPage = ({ ListContainer }) => {
  return () => {
    const [ params, setParams ] = useState(emptyObj)
    const handleClusterChange = useCallback(clusterId => setParams({ clusterId }), [setParams])
    const [ namespaces, loading, reload ] = useDataLoader('namespaces', params)
    return <div>
      <ClusterPicklist
        formField={false}
        onChange={handleClusterChange}
        value={params.clusterId}
      />
      <ListContainer loading={loading} data={namespaces} reload={reload} />
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

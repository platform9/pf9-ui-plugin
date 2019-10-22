import React, { useCallback } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { serviceActions } from 'k8s/components/pods/actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { pick } from 'ramda'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('Services', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(serviceActions.list, params)
    const updateClusterId = useCallback(clusterId => {
      updateParams({
        clusterId,
        namespace: allKey
      })
    }, [])
    return <ListContainer
      loading={loading}
      reload={reload}
      data={data}
      getParamsUpdater={getParamsUpdater}
      filters={<>
        <ClusterPicklist
          onChange={updateClusterId}
          value={params.clusterId}
          onlyMasterNodeClusters
        />
        <NamespacePicklist
          selectFirst={false}
          onChange={getParamsUpdater('namespace')}
          value={params.namespace}
          clusterId={params.clusterId}
          disabled={!params.clusterId}
        />
      </>}
      {...pick(listTablePrefs, params)}
    />
  }
}

export const options = {
  addUrl: '/ui/kubernetes/services/add',
  addText: 'Add Service',
  deleteFn: serviceActions.delete,
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  name: 'Services',
  title: 'Services',
  ListPage,
}
const components = createCRUDComponents(options)
export const ServicesList = components.List

export default components.ListPage

import React, { useCallback } from 'react'
import { deploymentActions } from 'k8s/components/pods/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import useDataLoader from 'core/hooks/useDataLoader'
import { pick } from 'ramda'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('Deployments', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(deploymentActions.list, params)
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
  loaderFn: deploymentActions.list,
  deleteFn: deploymentActions.delete,
  addUrl: '/ui/kubernetes/deployments/add',
  addText: 'Add Deployment',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  name: 'Deployments',
  title: 'Deployments',
  ListPage,
}
const components = createCRUDComponents(options)
export const DeploymentsList = components.List

export default components.ListPage

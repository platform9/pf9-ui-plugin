import React, { useCallback } from 'react'
import { deploymentActions } from 'k8s/components/pods/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import useDataLoader from 'core/hooks/useDataLoader'
import { pick } from 'ramda'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import renderLabels from 'k8s/components/pods/renderLabels'
import ExternalLink from 'core/components/ExternalLink'
import { DateAndTime } from 'core/components/listTable/cells/DateCell'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('Deployments', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(deploymentActions.list, params)
    const updateClusterId = useCallback((clusterId) => {
      updateParams({
        clusterId,
        namespace: allKey,
      })
    }, [])
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={data}
        getParamsUpdater={getParamsUpdater}
        filters={
          <>
            <ClusterPicklist
              selectFirst={false}
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
          </>
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

const renderName = (name, { dashboardUrl }) => {
  return (
    <span>
      {name}
      <br />
      <ExternalLink url={dashboardUrl}>dashboard</ExternalLink>
    </span>
  )
}

export const options = {
  loaderFn: deploymentActions.list,
  deleteFn: deploymentActions.delete,
  deleteCond: () => false,
  deleteDisabledInfo: 'Feature not yet implemented',
  addUrl: '/ui/kubernetes/pods/deployments/add',
  addText: 'Add Deployment',
  columns: [
    { id: 'name', label: 'Name', render: renderName },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'labels', label: 'Labels', render: renderLabels('label') },
    { id: 'selectors', label: 'Selectors', render: renderLabels('selector') },
    { id: 'pods', label: 'Pods' },
    { id: 'created', label: 'Age', render: (value) => <DateAndTime value={value} showToolTip /> },
  ],
  name: 'Deployments',
  title: 'Deployments',
  ListPage,
}
const components = createCRUDComponents(options)
export const DeploymentsList = components.List

export default components.ListPage

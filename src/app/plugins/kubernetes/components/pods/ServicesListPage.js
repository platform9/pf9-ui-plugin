import React, { useCallback } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { serviceActions } from 'k8s/components/pods/actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { pick } from 'ramda'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import ExternalLink from 'core/components/ExternalLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

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
        namespace: allKey,
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

const renderName = (name, { dashboardUrl }) => {
  return <span>
    {name}<br />
    <ExternalLink url={dashboardUrl}>dashboard
      <FontAwesomeIcon size="sm">file-alt</FontAwesomeIcon></ExternalLink>
  </span>
}
const successColor = {
  color: '#4ADF74',
}
const renderStatus = status => {
  return status === 'OK'
    ? <span><i style={successColor} className="fa-fw fa-lg fa-sm fa-check fal" />&nbsp;OK</span>
    : <span><i className="fa-fw fa-lg fa-sm fa-spin fa-spinner fal" />&nbsp;Pending</span>
}

const renderEndpoints = endpoints => {
  return <>
    {endpoints.map(endpoint => <div key={endpoint}>{endpoint}</div>)}
  </>
}

export const options = {
  addUrl: '/ui/kubernetes/services/add',
  addText: 'Add Service',
  deleteFn: serviceActions.delete,
  columns: [
    { id: 'name', label: 'Name', render: renderName },
    { id: 'type', label: 'Type' },
    { id: 'status', label: 'Status', render: renderStatus },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'namespace', label: 'Namespace' },
    // { id: 'labels', label: 'Labels', render: renderLabels('label') },
    // { id: 'selectors', label: 'Selectors', render: renderLabels('selector') },
    { id: 'clusterIp', label: 'Cluster IP' },
    { id: 'internalEndpoints', label: 'Internal Endpoints', render: renderEndpoints },
    { id: 'externalEndpoints', label: 'External Endpoints', render: renderEndpoints },
  ],
  name: 'Services',
  title: 'Services',
  ListPage,
}
const components = createCRUDComponents(options)
export const ServicesList = components.List

export default components.ListPage

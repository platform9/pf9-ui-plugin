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
import renderLabels from 'k8s/components/pods/renderLabels'
import ClusterStatusSpan from '../infrastructure/clusters/ClusterStatus'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('Services', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(serviceActions.list, params)
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

const renderStatus = (status) => {
  const serviceStatus = {
    status: status === 'OK' ? 'ok' : 'pending',
    label: status === 'OK' ? 'Connected' : 'Connecting',
  }
  return <ClusterStatusSpan status={serviceStatus.status}>{serviceStatus.label}</ClusterStatusSpan>
}

const renderEndpoints = (endpoints) => {
  return (
    <>
      {endpoints.map((endpoint, i) => (
        <div key={i}>{endpoint}</div>
      ))}
    </>
  )
}

export const options = {
  addUrl: '/ui/kubernetes/pods/services/add',
  addText: 'Add Service',
  deleteFn: serviceActions.delete,
  columns: [
    { id: 'name', label: 'Name', render: renderName },
    { id: 'type', label: 'Type' },
    { id: 'status', label: 'Status', render: renderStatus },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'labels', label: 'Labels', render: renderLabels('label') },
    { id: 'selectors', label: 'Selectors', render: renderLabels('selector') },
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

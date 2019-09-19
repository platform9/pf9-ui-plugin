// import React from 'react'
// import ExternalLink from 'core/components/ExternalLink'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { prometheusInstancesCacheKey } from './actions'

const renderKeyValues = obj => Object.entries(obj)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')

// Disabling for now until the backend has the links for this working
/*
const renderDashboardLink = (field, row, context) => {
  const link = ApiCLient.getInstance().qbert.getPrometheusDashboardLink(row)
  return <ExternalLink url={link}>dashboard</ExternalLink>
}
*/

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'Cluster' },
  { id: 'namespace', label: 'Namespace' },
  // { id: 'dashboard', label: 'Dashboard', render: renderDashboardLink },
  { id: 'serviceMonitorSelector', label: 'Service Monitor', render: renderKeyValues },
  { id: 'alertManagersSelector', label: 'Alert Managers' },
  { id: 'cpu', label: 'CPU' },
  { id: 'storage', label: 'Storage', display: false },
  { id: 'memory', label: 'Memory' },
  { id: 'retention', label: 'Retention' },
  { id: 'version', label: 'Version' },
  { id: 'replicas', label: 'Replicas' },
]

export const options = {
  cacheKey: prometheusInstancesCacheKey,
  addUrl: '/ui/kubernetes/prometheus/instances/add',
  addText: 'New Instance',
  columns,
  editUrl: '/ui/kubernetes/prometheus/instances/edit',
  name: 'PrometheusInstances',
  uniqueIdentifier: 'uid',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusInstancesList = List

export default ListPage

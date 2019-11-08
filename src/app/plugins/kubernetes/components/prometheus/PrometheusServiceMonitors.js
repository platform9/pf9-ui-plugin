import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { prometheusServiceMonitorsCacheKey } from './actions'

const renderKeyValues = obj => Object.entries(obj)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')

const renderExpressions = obj => Object.entries(obj)
  .map(([k, v]) => `${v.key} '${v.operator}' ${v.values.join(', ')}`)
  .join('; ')

const renderSelector = obj => (
  <div>
    <div>
      {(obj.matchExpressions && renderExpressions(obj.matchExpressions))}
    </div>
    <div>
      {(obj.matchLabels && renderKeyValues(obj.matchLabels))}
    </div>
  </div>
)
export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'Cluster' },
  { id: 'namespace', label: 'Namespace' },
  { id: 'labels', label: 'Labels', render: renderKeyValues },
  { id: 'port', label: 'Endpoints' },
  { id: 'namespaceSelector', label: 'Namespace Selector' },
  { id: 'selector', label: 'Application Selector', render: renderSelector }
]

export const options = {
  columns,
  cacheKey: prometheusServiceMonitorsCacheKey,
  editUrl: '/ui/kubernetes/prometheus/serviceMonitors/edit',
  name: 'PrometheusServiceMonitors',
  title: 'Prometheus Service Monitors',
  uniqueIdentifier: 'uid',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusServiceMonitorsList = List

export default ListPage

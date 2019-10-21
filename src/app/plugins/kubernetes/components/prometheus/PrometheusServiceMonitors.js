import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { prometheusServiceMonitorsCacheKey } from './actions'

const renderKeyValues = obj => Object.entries(obj)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'Cluster' },
  { id: 'namespace', label: 'Namespace' },
  { id: 'labels', label: 'Labels', render: renderKeyValues },
  { id: 'port', label: 'Port' },
  { id: 'selector', label: 'Selector', render: renderKeyValues },
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

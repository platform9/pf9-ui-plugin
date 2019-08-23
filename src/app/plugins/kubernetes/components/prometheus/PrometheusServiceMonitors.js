import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { prometheusServiceMonitorsDataKey } from './actions'

const renderKeyValues = obj => Object.entries(obj)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')

const renderClusterName = (field, row, context) => {
  const cluster = context.clusters.find(x => x.uuid === row.clusterUuid)
  return cluster.name
}

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'Cluster', render: renderClusterName },
  { id: 'namespace', label: 'Namespace' },
  { id: 'labels',  label: 'Labels', render: renderKeyValues },
  { id: 'port',  label: 'Port' },
  { id: 'selector',  label: 'Selector', render: renderKeyValues },
]

export const options = {
  columns,
  dataKey: prometheusServiceMonitorsDataKey,
  editUrl: '/ui/kubernetes/prometheus/serviceMonitors/edit',
  name: 'PrometheusServiceMonitors',
  title: 'Prometheus Service Monitors',
  uniqueIdentifier: 'uid',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusServiceMonitorsList = List

export default ListPage

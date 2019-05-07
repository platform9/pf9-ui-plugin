import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadPrometheusResources } from './actions'

const renderKeyValues = obj => Object.entries(obj)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', <br/>')

const renderClusterName = (field, row, context) => {
  const cluster = context.clusters.find(x => x.uuid === row.clusterUuid)
  return cluster.name
}

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'cluster', render: renderClusterName },
  { id: 'namespace', label: 'Namespace' },
  { id: 'serviceMonitorSelector', label: 'Service Monitor', render: renderKeyValues },
  { id: 'alertManagersSelector', label: 'Alert Managers' },
  { id: 'cpu', label: 'CPU' },
  { id: 'storage', label: 'Storage' },
  { id: 'memory', label: 'Memory' },
  { id: 'retention', label: 'Retention' },
  { id: 'version', label: 'version' },
  { id: 'replicas', label: '# of instances' },
]

export const options = {
  addUrl: '/ui/kubernetes/prometheus/instances/add',
  columns,
  dataKey: 'prometheusInstances',
  editUrl: '/ui/kubernetes/prometheus/instances/edit',
  loaderFn: loadPrometheusResources,
  name: 'PrometheusInstances',
  title: 'Prometheus Instances',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusInstancesList = List

export default ListPage

import createCRUDComponents from 'core/helpers/createCRUDComponents'
import {
  deletePrometheusInstance,
  loadPrometheusResources,
} from './actions'

const renderKeyValues = obj => Object.entries(obj)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')

const renderClusterName = (field, row, context) => {
  const cluster = context.clusters.find(x => x.uuid === row.clusterUuid)
  return cluster.name
}

// Placeholder for now until the dashboard links are working
const renderBlank = () => ''

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'cluster', render: renderClusterName },
  { id: 'namespace', label: 'Namespace' },
  { id: 'dashboard', label: 'Dashboard', render: renderBlank },
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
  deleteFn: deletePrometheusInstance,
  editUrl: '/ui/kubernetes/prometheus/instances/edit',
  loaderFn: loadPrometheusResources,
  name: 'PrometheusInstances',
  title: 'Prometheus Instances',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusInstancesList = List

export default ListPage

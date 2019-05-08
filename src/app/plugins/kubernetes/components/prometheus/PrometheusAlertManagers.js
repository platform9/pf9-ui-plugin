import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadPrometheusAlertManagers } from './actions'

const renderClusterName = (field, row, context) => {
  const cluster = context.clusters.find(x => x.uuid === row.clusterUuid)
  return cluster.name
}

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'Cluster', render: renderClusterName },
  { id: 'namespace', label: 'Namespace' },
  { id: 'replicas', label: 'Replicas' },
]

export const options = {
  columns,
  dataKey: 'prometheusAlertManagers',
  editUrl: '/ui/kubernetes/prometheus/alertManagers/edit',
  loaderFn: loadPrometheusAlertManagers,
  name: 'PrometheusAlertManagers',
  title: 'Prometheus Alert Managers',
  uniqueIdentifier: 'name',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusAlertManagerList = List

export default ListPage

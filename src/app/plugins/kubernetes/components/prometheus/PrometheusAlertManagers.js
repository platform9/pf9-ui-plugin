import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { prometheusAlertManagersCacheKey } from './actions'

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
  cacheKey: prometheusAlertManagersCacheKey,
  editUrl: '/ui/kubernetes/prometheus/alertManagers/edit',
  name: 'PrometheusAlertManagers',
  title: 'Prometheus Alert Managers',
  uniqueIdentifier: 'uid',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusAlertManagerList = List

export default ListPage

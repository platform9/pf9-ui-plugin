import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { prometheusAlertManagersCacheKey } from './actions'

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'Cluster' },
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

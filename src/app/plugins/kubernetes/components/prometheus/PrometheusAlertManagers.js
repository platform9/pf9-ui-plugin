import createCRUDComponents from 'core/helpers/createCRUDComponents'
import DataKeys from 'k8s/DataKeys'

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'Cluster' },
  { id: 'namespace', label: 'Namespace' },
  { id: 'replicas', label: 'Replicas' },
]

export const options = {
  columns,
  cacheKey: DataKeys.PrometheusAlertManagers,
  editUrl: '/ui/kubernetes/prometheus/alertManagers/edit',
  name: 'PrometheusAlertManagers',
  title: 'Prometheus Alert Managers',
  uniqueIdentifier: 'uid',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusAlertManagerList = List

export default ListPage

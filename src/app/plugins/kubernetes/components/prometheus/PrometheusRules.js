import createCRUDComponents from 'core/helpers/createCRUDComponents'
import {
  deletePrometheusRule,
  loadPrometheusRules,
} from './actions'

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
  { id: 'labels',  label: 'Labels', render: renderKeyValues }
]

export const options = {
  columns,
  dataKey: 'prometheusRules',
  deleteFn: deletePrometheusRule,
  editUrl: '/ui/kubernetes/prometheus/rules/edit',
  loaderFn: loadPrometheusRules,
  name: 'PrometheusRules',
  title: 'Prometheus Rules',
  uniqueIdentifier: 'uid',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusRulesList = List

export default ListPage

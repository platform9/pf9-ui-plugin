import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { prometheusRulesDataKey } from './actions'

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
  dataKey: prometheusRulesDataKey,
  editUrl: '/ui/kubernetes/prometheus/rules/edit',
  name: 'PrometheusRules',
  title: 'Prometheus Rules',
  uniqueIdentifier: 'uid',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusRulesList = List

export default ListPage

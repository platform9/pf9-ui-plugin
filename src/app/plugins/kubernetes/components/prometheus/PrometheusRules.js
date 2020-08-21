import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { ActionDataKeys } from 'k8s/DataKeys'

const renderKeyValues = (obj) =>
  Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'clusterName', label: 'Cluster' },
  { id: 'namespace', label: 'Namespace' },
  { id: 'labels', label: 'Labels', render: renderKeyValues },
]

export const options = {
  columns,
  cacheKey: ActionDataKeys.PrometheusRules,
  editUrl: '/ui/kubernetes/prometheus/rules/edit',
  name: 'PrometheusRules',
  title: 'Prometheus Rule Set',
  uniqueIdentifier: 'uid',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusRulesList = List

export default ListPage

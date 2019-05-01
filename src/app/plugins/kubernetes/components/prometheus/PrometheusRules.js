import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadPrometheusResources } from './actions'

const renderKeyValues = obj => Object.entries(obj)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'namespace', label: 'Namespace' },
  { id: 'labels',  label: 'labels', render: renderKeyValues }
]

export const options = {
  columns,
  dataKey: 'prometheusRules',
  editUrl: '/ui/kubernetes/prometheus/rules/edit',
  loaderFn: args => loadPrometheusResources(),
  name: 'PrometheusRules',
  title: 'Prometheus Rules',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusInstancesList = List

export default ListPage

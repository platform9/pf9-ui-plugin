// import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadPrometheusInstances } from './actions'

const renderAsJson = data => JSON.stringify(data)

export const columns = [
  { id: 'name', label: 'Name' },
  { id: 'namespace', label: 'Namespace' },
  { id: 'serviceMonitor', label: 'Service Monitor', render: renderAsJson },
  { id: 'alertManager', label: 'Alert Manager' },
  { id: 'disk', label: 'Disk' },
  { id: 'retention', label: 'Retention' },
  { id: 'version', label: 'version' },
  { id: 'status', label: 'Status' },
  { id: 'age', label: 'Age' },
  { id: 'numInstances', label: '# Instances' },
]

export const options = {
  addUrl: '/ui/kubernetes/prometheus/instances/add',
  columns,
  dataKey: 'prometheusInstances',
  editUrl: '/ui/kubernetes/prometheus/instances/edit',
  loaderFn: loadPrometheusInstances,
  name: 'PrometheusInstances',
  title: 'Prometheus Instances',
}

const { ListPage, List } = createCRUDComponents(options)
export const PrometheusInstancesList = List

export default ListPage

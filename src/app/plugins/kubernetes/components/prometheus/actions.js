import { pathOrNull } from 'utils/fp'
import { pathOr, prop } from 'ramda'
// import { loadClusters } from '../infrastructure/actions'

const mapServiceMonitor = x => x

const mapRule = ({ metadata, spec }) => ({
  name: metadata.name,
  namespace: metadata.namespace,
  labels: metadata.labels,
})

const mapAlertMonitor = prop('name')

const mapPrometheusInstance = ({ metadata, spec }) => ({
  name: metadata.name,
  namespace: metadata.namespace,
  id: metadata.uid,
  serviceMonitorSelector: pathOrNull('serviceMonitorSelector.matchLabels', spec),
  alertManagersSelector:
    pathOr([], ['alerting', 'alertmanagers'], spec)
      .map(mapAlertMonitor)
      .join(', '),
  ruleSelector: pathOrNull('ruleSelector.matchLabels', spec),
  cpu: pathOrNull('resources.requests.cpu', spec),
  storage: pathOrNull('resources.requests.storage', spec),
  memory: pathOrNull('resources.requests.memory', spec),
  version: metadata.resourceVersion,
  retention: spec.retention,
  replicas: spec.replicas,
  metadata,
  spec,
})

const getPrometheusInstances = uuid => context.apiClient.qbert.getPrometheusInstances(uuid)

const mapAsyncItems = async (values, loaderFn, mapFn) => {
  const promises = values.map(loaderFn)
  const responses = await Promise.all(promises)
  console.log(responses)
  const items = responses.map(prop('items')).flat()
  console.log(items)
  const mapped = items.map(mapFn)
  return mapped
}
export const loadPrometheusResources = async ({ context, setContext, reload }) => {
  if (!reload && context.prometheusInstances) { return context.prometheusInstances }

  // const clusters = await loadClusters({ context, setContext, reload })
  // const clusterUuids = clusters.map(prop('uuid'))
  const clusterUuids = ['e8f1d175-2e7d-40fa-a475-ed20b8d8c66d'] // hardcode for now during development

  mapAsyncItems(clusterUuids, getPrometheusInstances, mapPrometheusInstance)
    .then(prometheusInstances => setContext({ prometheusInstances }))

  /*
  parallelFlatMap(clusterUuids, uuid => ))
    .then(tap(x => console.log(x)))
    .then(response => (response || []).map(prop('items')))
    .then(tap(x => console.log(x)))
    .then(instances => instances.map(mapPrometheusInstance))
    .then(tap(x => console.log(x)))
    .then(prometheusInstances => setContext({ prometheusInstances }))
  */

  const serviceMonitorsResponse = await context.apiClient.qbert.getPrometheusServiceMonitors('e8f1d175-2e7d-40fa-a475-ed20b8d8c66d')
  const prometheusServiceMonitors = serviceMonitorsResponse.items.map(mapServiceMonitor)

  const rulesResponse = await context.apiClient.qbert.getPrometheusRules('e8f1d175-2e7d-40fa-a475-ed20b8d8c66d')
  const prometheusRules = rulesResponse.items.map(mapRule)

  setContext({ prometheusServiceMonitors, prometheusRules })
}

export const createPrometheusInstance = async ({ data, context, setContext }) => {
  const createdInstance = await context.apiClient.qbert.createPrometheusInstance(data.cluster, data)
  console.log('createdPrometheusInstance', createdInstance)
}

export const loadServiceAccounts = async ({ data, context, setContext }) => {
  const serviceAccounts = await context.apiClient.qbert.getServiceAccounts(data.cluster)
  return serviceAccounts
}

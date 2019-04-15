import { pathOrNull } from 'utils/fp'
import { pathOr, prop } from 'ramda'

const mapServiceMonitor = x => x
const mapRule = x => x
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

export const loadPrometheusResources = async ({ context, setContext, reload }) => {
  if (!reload && context.prometheusInstances) { return context.prometheusInstances }

  const instancesResponse = await context.apiClient.qbert.getPrometheusInstances('e8f1d175-2e7d-40fa-a475-ed20b8d8c66d')
  const prometheusInstances = instancesResponse.items.map(mapPrometheusInstance)

  const serviceMonitorsResponse = await context.apiClient.qbert.getPrometheusServiceMonitors('e8f1d175-2e7d-40fa-a475-ed20b8d8c66d')
  const prometheusServiceMonitors = serviceMonitorsResponse.items.map(mapServiceMonitor)

  const rulesResponse = await context.apiClient.qbert.getPrometheusRules('e8f1d175-2e7d-40fa-a475-ed20b8d8c66d')
  const prometheusRules = rulesResponse.items.map(mapRule)

  setContext({ prometheusInstances, prometheusServiceMonitors, prometheusRules })
  return prometheusInstances
}

export const createPrometheusInstance = async ({ data, context, setContext }) => {
  const createdInstance = await context.apiClient.qbert.createPrometheusInstance(data.cluster, data)
  console.log('createdPrometheusInstance', createdInstance)
}

export const loadServiceAccounts = async ({ data, context, setContext }) => {
  const serviceAccounts = await context.apiClient.qbert.getServiceAccounts(data.cluster)
  return serviceAccounts
}

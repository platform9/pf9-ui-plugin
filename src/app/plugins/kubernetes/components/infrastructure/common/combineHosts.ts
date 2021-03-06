import { condLiteral, pathStrOrNull } from 'utils/fp'
import { __, both, includes, T, pipe } from 'ramda'
import { localizeRoles } from 'api-client/ResMgr'
import moment from 'moment'
import {
  HostByService,
  IAnnotateResmgrFields,
  IAnnotateUiState,
  IAnnotateCloudStack,
  ICombinedHost,
} from './model'
import { ExtensionsClass } from 'api-client/resmgr.model'

const openstackRoles = [
  'Block Storage',
  'Contrail Forwarder',
  'Image Library',
  'VMware Glance',
  'VMware Cluster',
  'Hypervisor',
  'MidoNet Node',
  'Network Node',
  'Designate',
  'Telemetry',
]

const k8sRoles = ['Containervisor']

export const annotateCloudStack = (host: IAnnotateUiState) => {
  const localizedRoles = localizeRoles(host.roles)
  const isOpenStack = () => localizedRoles.some(includes(__, openstackRoles))
  const isK8s = () => localizedRoles.some(includes(__, k8sRoles))
  const cloudStack = condLiteral(
    [both(isOpenStack, isK8s), 'both'],
    [isOpenStack, 'openstack'],
    [isK8s, 'k8s'],
    [T, 'unknown'],
  )(host)
  return { ...host, cloudStack }
}

export const annotateResmgrFields = (host: HostByService) => {
  const resmgrRoles = host?.resmgr?.roles || []
  const extensions = host?.resmgr?.extensions as ExtensionsClass
  const message = host?.resmgr?.message as { warn: string }
  return {
    ...host,
    id: host?.resmgr?.id,
    roles: resmgrRoles,
    roleStatus: host?.resmgr?.role_status,
    roleData: {},
    responding: host?.resmgr?.info?.responding,
    hostname: host?.resmgr?.info?.hostname,
    osInfo: host?.resmgr?.info?.os_info,
    networks: [],
    vCenterIP: extensions?.hypervisor_details?.data.vcenter_ip,
    supportRole: resmgrRoles.includes('pf9-support'),
    networkInterfaces: extensions?.interfaces?.data.iface_ip,
    warnings: message?.warn,
  }
}

export const annotateUiState = (hosts: IAnnotateResmgrFields) => {
  const host: IAnnotateUiState = hosts as any
  const { resmgr = {} } = host
  /* TODO:
   * This code is very confusing and has too much complected state.  These
   * rules have been added over the years but nobody really understands
   * what is going on.
   *
   * We have a spreadsheet at:
   * https://docs.google.com/spreadsheets/d/1JZ6dCGtnMIyabLD0MD3YklsqGDafZfdoUEMRFeSqUB0/edit#gid=0
   *
   * Unfortunately it is not up to date.
   *
   * We are trying to collapse too many dimensions of data into a single status
   * field.  Perhaps we can split these up.  This would mean potentially
   * changing how the UI looks though.
   *
   * Also, some of these fields can be added to the ResMgr backend.
   *
   * This section should be flagged for further review.
   */
  const { roles, roleStatus, responding, warnings } = host
  if (roles.length === 0 || (roles.length === 1 && roles.includes('pf9-support'))) {
    host.uiState = 'unauthorized'
  }

  if (responding) {
    if (['converging', 'retrying'].includes(roleStatus)) {
      host.uiState = 'pending'
    }
    if (roleStatus === 'ok' && roles.length > 0) {
      host.uiState = 'online'
    }
    if (warnings && warnings.length > 0) {
      host.uiState = 'drifted'
    }
  }

  if (!host.uiState && !responding) {
    host.uiState = 'offline'
    const lastResponseTime = pathStrOrNull('info.last_response_time', resmgr)
    host.lastResponse = moment.utc(lastResponseTime).fromNow(true)
    host.lastResponseData =
      lastResponseTime &&
      lastResponseTime
        .split(' ')
        .join('T')
        .concat('Z')
    // Even though the host is offline we may or may not have stats for it
    // depending on if the roles were authorized successfully in the past.
    host.hasStats = roleStatus === 'ok'
  }

  const credentials = pathStrOrNull('extensions.hypervisor_details.data.credentials', resmgr)
  if (credentials === 'invalid') {
    host.uiState = 'invalid'
  }
  if (roleStatus === 'failed') {
    host.uiState = 'error'
  }

  return { ...host }
}

export const annotateNovaFields = (host) => {
  // TODO: add nova specific logic in here
  return { ...host }
}

export const calcResourceUtilization = (host: IAnnotateCloudStack): ICombinedHost => {
  const extensions = host?.resmgr?.extensions as ExtensionsClass
  const usage = extensions?.resource_usage?.data || null
  if (!usage) return { ...host, usage: null }
  const { cpu, memory, disk } = usage

  const K = 1000
  const M = 1000 * K
  const G = 1000 * M
  const Ki = 1024
  const Mi = 1024 * Ki
  const Gi = 1024 * Mi

  const stats = {
    compute: {
      current: cpu.used / G,
      max: cpu.total / G,
      units: 'GHz',
      type: 'used',
    },
    memory: {
      current: (memory.total - memory.available) / Gi,
      max: memory.total / Gi,
      units: 'GB',
      type: 'used',
    },
    disk: {
      current: disk.used / Gi,
      max: disk.total / Gi,
      units: 'GB',
      type: 'used',
    },
  }

  return {
    ...host,
    usage: stats,
  }
}

export const combineHost = pipe<
  HostByService,
  IAnnotateResmgrFields,
  IAnnotateUiState,
  IAnnotateUiState,
  IAnnotateCloudStack,
  ICombinedHost
>(
  annotateResmgrFields,
  annotateUiState,
  annotateNovaFields,
  annotateCloudStack,
  calcResourceUtilization,
)

import { emptyArr, pathStrOrNull } from 'utils/fp'
import { pipe } from 'ramda'
// import { localizeRoles } from 'api-client/ResMgr'
import moment from 'moment'
import {
  HostByService,
  IAnnotateResmgrFields,
  IAnnotateUiState,
  IAnnotateCloudStack,
  ICombinedHost,
} from './model'

enum CloudStack {
  Both = 'both',
  Openstack = 'openstack',
  Kubernetes = 'k8s',
  Unknown = 'unknown',
}
const getCloudStack = (stackSet) => {
  if (stackSet.size === 2) {
    return CloudStack.Both
  }
  if (stackSet.size === 1) {
    return stackSet.values().next().value
  }
  return CloudStack.Unknown
}
const formattedRoleMapping = {
  'pf9-ostackhost-neutron': { name: 'Hypervisor', stack: CloudStack.Openstack },
  'pf9-ostackhost': { name: 'Hypervisor', stack: CloudStack.Openstack },
  'pf9-ostackhost-neutron-vmw': { name: 'VMware Cluster', stack: CloudStack.Openstack },
  'pf9-ostackhost-vmw': { name: 'VMware Cluster', stack: CloudStack.Openstack },
  'pf9-ceilometer': { name: 'Telemetry', stack: CloudStack.Openstack },
  'pf9-ceilometer-vmw': { name: 'Telemetry', stack: CloudStack.Openstack },
  'pf9-cindervolume-base': { name: 'Block Storage', stack: CloudStack.Openstack },
  'pf9-designate': { name: 'Designate', stack: CloudStack.Openstack },
  'pf9-glance-role': { name: 'Image Library', stack: CloudStack.Openstack },
  'pf9-glance-role-vmw': { name: 'VMware Glance', stack: CloudStack.Openstack },
  'pf9-kube': { name: 'Containervisor', stack: CloudStack.Kubernetes },
  'pf9-ostackhost-neutron-ironic': { name: 'Ironic', stack: CloudStack.Openstack },
  'pf9-contrail-forwarder': { name: 'Contrail Forwarder', stack: CloudStack.Openstack },
  'pf9-midonet-forwarder': { name: 'MidoNet Node', stack: CloudStack.Openstack },
}

const neutronComponents = {
  'pf9-neutron-base': true,
  'pf9-neutron-ovs-agent': true,
  'pf9-neutron-l3-agent': true,
  'pf9-neutron-dhcp-agent': true,
  'pf9-neutron-metadata-agent': true,
}
const neutronComponentsLength = Object.keys(neutronComponents).length

const localizeRole = (role) => {
  return formattedRoleMapping[role] || { name: role }
}

const isNeutronRole = (role) => !!neutronComponents[role]

export const annotateCloudStack = (host: IAnnotateUiState) => {
  const roles = host?.roles || emptyArr
  const neutronRoles = new Set()
  const normalRoles = new Set()
  const cloudStack = new Set()

  roles.forEach((role) => {
    if (isNeutronRole(role)) {
      neutronRoles.add(role)
    } else {
      const { name, stack } = localizeRole(role) || {}
      if (stack) cloudStack.add(stack)
      normalRoles.add(name)
    }
  })

  const hasAllNetworkRoles = neutronRoles.size === neutronComponentsLength
  if (hasAllNetworkRoles) {
    normalRoles.add('Network Node')
    cloudStack.add(CloudStack.Openstack)
  }
  return { ...host, cloudStack: getCloudStack(cloudStack) }
}

export const annotateResmgrFields = (host: HostByService) => {
  const resmgrRoles = host?.resmgr?.roles || []
  const extensions = host?.resmgr?.extensions
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
  let uiState = ''
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
    uiState = 'unauthorized'
  }

  if (responding) {
    if (['converging', 'retrying'].includes(roleStatus)) {
      uiState = 'pending'
    }
    if (roleStatus === 'ok' && roles.length > 0) {
      uiState = 'online'
    }
    if (warnings && warnings.length > 0) {
      uiState = 'drifted'
    }
  }
  let lastResponse = ''
  if (!uiState && !responding) {
    uiState = 'offline'
    const lastResponseTime = pathStrOrNull('info.last_response_time', resmgr)
    lastResponse = moment.utc(lastResponseTime).fromNow(true)
    // host.lastResponseData =
    //   lastResponseTime &&
    //   lastResponseTime
    //     .split(' ')
    //     .join('T')
    //     .concat('Z')
    // // Even though the host is offline we may or may not have stats for it
    // // depending on if the roles were authorized successfully in the past.
    // host.hasStats = roleStatus === 'ok'
  }

  const credentials = pathStrOrNull('extensions.hypervisor_details.data.credentials', resmgr)
  if (credentials === 'invalid') {
    uiState = 'invalid'
  }
  if (roleStatus === 'failed') {
    uiState = 'error'
  }

  return { ...host, lastResponse, uiState }
}

export const calcResourceUtilization = (host: IAnnotateCloudStack): ICombinedHost => {
  const extensions = host?.resmgr?.extensions
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
  Partial<HostByService>,
  IAnnotateResmgrFields,
  IAnnotateUiState,
  IAnnotateCloudStack,
  ICombinedHost
>(annotateResmgrFields, annotateUiState, annotateCloudStack, calcResourceUtilization)

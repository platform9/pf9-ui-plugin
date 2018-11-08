import moment from 'moment'
import { pathOr } from 'ramda'
import { pipe } from 'core/fp'

const pathOrNull = pathStr => pathOr(null, pathStr.split('.'))

export const annotateResmgrFields = host => {
  const { resmgr } = host
  return {
    ...host,
    roles: resmgr.roles || [],
    roleStatus: resmgr.role_status,
    roleData: {},
    responding: resmgr.info.responding,
    hostname: resmgr.info.hostname,
    osInfo: resmgr.info.os_info,
    networks: [],
    vCenterIP: pathOrNull('extensions.hypervisor_details.data.vcenter_ip', resmgr),
    supportRole: resmgr.roles.includes('pf9-support'),
    networkInterfaces: pathOrNull('extensions.interfaces.data.iface_ip', resmgr),
    warnings: resmgr.message && resmgr.message.warn,
  }
}

export const annotateUiState = host => {
  const { resmgr } = host

  /* TODO:
   * This code is very confusing and has too much complected state.  These
   * rules have been added over the years but nobody really understands
   * what is going on.
   *
   * We have a spreadsheet at:
   *   https://docs.google.com/spreadsheets/d/1JZ6dCGtnMIyabLD0MD3YklsqGDafZfdoUEMRFeSqUB0/edit#gid=0
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
    if (['converging', 'retrying'].includes(roleStatus)) { host.uiState = 'pending' }
    if (roleStatus === 'ok' && roles.length > 0) { host.uiState = 'online' }
    if (warnings && warnings.length > 0) { host.uiState = 'drifted' }
  }

  if (!host.uiState && !responding) {
    host.uiState = 'offline'
    const lastResponseTime = resmgr.info.last_response_time
    host.lastResponse = moment.utc(lastResponseTime).fromNow(true)
    host.lastResponseData = lastResponseTime && lastResponseTime.split(' ').join('T').concat('Z')
    // Even though the host is offline we may or may not have stats for it
    // depending on if the roles were authorized successfully in the past.
    host.hasStats = roleStatus === 'ok'
  }

  const credentials = pathOrNull('extensions.hypervisor_details.data.credentials', resmgr)
  if (credentials === 'invalid') { host.uiState = 'invalid' }
  if (roleStatus === 'failed') { host.uiState = 'error' }

  return host
}

export const annotateNovaFields = host => {
  // TODO: add nova specific logic in here
  return host
}

export const combineHost =
  pipe(
    annotateResmgrFields,
    annotateUiState,
    annotateNovaFields,
  )

import { createSelector } from 'reselect'
import { toPairs } from 'ramda'
import { combineHost } from 'k8s/components/infrastructure/common/combineHosts'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { HostByService, HostTypes } from './model'
import { Host } from 'api-client/resmgr.model'
import { emptyArr } from 'utils/fp'
import logger from 'core/utils/logger'

const getIpPreview = (ips: string[] | Readonly<string[]> = emptyArr) => {
  if (!Array.isArray(ips)) {
    return emptyArr
  }
  // Get first IP that does not start with 192
  return ips.find((ip) => ip.substring(0, 3) !== '192') || ips[0]
}

const getNetworkInterfaces = (node: Host) => {
  const extensions = node?.extensions
  const ifaceMap = extensions?.interfaces?.data?.iface_info
  // Pair the interface name (obj key) to the data (obj value)
  const pairedIfaces: any = toPairs(ifaceMap)
  const ifaceList = pairedIfaces.map((pair) => {
    // Some interfaces have multiple IP addresses
    const ifaces = pair[1]?.ifaces
    return ifaces.map((iface) => ({
      name: pair[0],
      mac: pair[1]?.mac,
      ip: iface.addr,
      netmask: iface.netmask,
      label: `${pair[0]}: ${iface.addr}`,
    }))
  })
  return ifaceList.flat() // [[interface, ip], [interface2, ip2], ...]
}

export const resMgrHostsSelector = createSelector(
  [getDataSelector<DataKeys.ResMgrHosts>(DataKeys.ResMgrHosts)],
  logger('resMgrHostsSelector', (hosts) => {
    const hostsById = {}
    hosts.forEach((item) => {
      const extensions = item?.extensions

      // combineHosts expects resmgr to be a key on the host object
      // so we can start with that structure here
      const host = {
        [HostTypes.Resmgr]: {
          ...item,
          resourceType: HostTypes.Resmgr,
          ipPreview: getIpPreview(extensions?.ip_address?.data),
          networkInterfaces: getNetworkInterfaces(item),
          ovsBridges: extensions?.interfaces?.data.ovs_bridges || emptyArr,
        },
      }
      // all of the combined host annotation is based on resmgr
      // so we can do the combineHost call here
      const combined = combineHost(host)
      hostsById[item.id] = { ...host, ...combined }
    })
    return hostsById
  }),
)

export const combinedHostsSelector = createSelector(
  getDataSelector<DataKeys.Nodes>(DataKeys.Nodes),
  resMgrHostsSelector,
  logger('combinedHostsSelector', (rawNodes, resMgrHostsById) => {
    const hostsById: {
      [key: string]: HostByService
    } = {
      ...resMgrHostsById,
    }

    rawNodes.forEach((node) => {
      hostsById[node.uuid] = hostsById[node.uuid] || ({} as any)
      hostsById[node.uuid][HostTypes.Qbert] = node
    })

    // Convert it back to array form
    return hostsById
  }),
)

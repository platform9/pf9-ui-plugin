import { createSelector } from 'reselect'
import { pathOr, toPairs } from 'ramda'
import { emptyArr } from 'utils/fp'
import { dataStoreKey, cacheStoreKey } from 'core/caching/cacheReducers'
import { combineHost } from 'k8s/components/infrastructure/common/combineHosts'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { HostByService, HostType, ICombinedHost, IResMgrHostsSelector } from './model'
import { Node } from 'api-client/qbert.model'
import { Host, ExtensionsClass } from 'api-client/resmgr.model'
import { GlobalState } from 'k8s/datakeys.model'

const getIpPreview = (ips: string[] = []) =>
  // Get first IP that does not start with 192
  ips.find((ip) => ip.substring(0, 3) !== '192') || ips[0]

const getNetworkInterfaces = (node: Host) => {
  const extensions = node?.extensions as ExtensionsClass
  const ifaceMap = extensions?.interfaces?.data?.iface_info
  // Pair the interface name (obj key) to the data (obj value)
  const pairedIfaces = toPairs(ifaceMap)
  const ifaceList = pairedIfaces.map((pair) => {
    // Some interfaces have multiple IP addresses
    const ifaces = pair[1].ifaces
    return ifaces.map((iface) => ({
      name: pair[0],
      mac: pair[1].mac,
      ip: iface.addr,
      netmask: iface.netmask,
      label: `${pair[0]}: ${iface.addr}`,
    }))
  })
  return ifaceList.flat() // [[interface, ip], [interface2, ip2], ...]
}

export const combinedHostsSelector = createSelector<GlobalState, Node[], Host[], ICombinedHost[]>(
  getDataSelector<DataKeys.Nodes>(DataKeys.Nodes),
  getDataSelector<DataKeys.ResMgrHosts>(DataKeys.ResMgrHosts),
  (rawNodes, resMgrHosts) => {
    const hostsById: {
      [key: string]: HostByService
    } = {}
    // We don't want to perform a check to see if the object exists yet for each type of host
    // so make a utility to make it cleaner.
    const setHost = (type: HostType, id: string, value) => {
      hostsById[id] = hostsById[id] || ({} as any)
      hostsById[id][type] = value
    }
    rawNodes.forEach((node) => setHost('qbert', node.uuid, node))
    resMgrHosts.forEach((resMgrHost) => setHost('resmgr', resMgrHost.id, resMgrHost))

    // Convert it back to array form
    return Object.values(hostsById).map(combineHost)
  },
)

export const resMgrHostsSelector = createSelector<GlobalState, Host[], IResMgrHostsSelector[]>(
  getDataSelector<DataKeys.ResMgrHosts>(DataKeys.ResMgrHosts),
  (hosts) =>
    hosts.map((item) => {
      const extensions = item?.extensions as ExtensionsClass
      return {
        ...item,
        ipPreview: getIpPreview(extensions?.ip_address?.data || []),
        networkInterfaces: getNetworkInterfaces(item),
        ovsBridges: extensions.interfaces.data.ovs_bridges || [],
      }
    }),
)

import { createSelector } from 'reselect'
import { pathOr, toPairs } from 'ramda'
import { emptyArr } from 'utils/fp'
import { dataStoreKey, cacheStoreKey } from 'core/caching/cacheReducers'
import { combineHost } from 'k8s/components/infrastructure/common/combineHosts'
import DataKeys from 'k8s/DataKeys'

const getIpPreview = (ips = []) =>
  // Get first IP that does not start with 192
  ips.find((ip) => ip.substring(0, 3) !== '192') || ips[0]

const getNetworkInterfaces = (node) => {
  const ifaceMap = pathOr([], ['extensions', 'interfaces', 'data', 'iface_info'], node)
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

export const combinedHostsSelector = createSelector(
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, DataKeys.Nodes]),
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, DataKeys.ResMgrHosts]),
  (rawNodes, resMgrHosts) => {
    const hostsById = {}
    // We don't want to perform a check to see if the object exists yet for each type of host
    // so make a utility to make it cleaner.
    const setHost = (type, id, value) => {
      hostsById[id] = hostsById[id] || {}
      hostsById[id][type] = value
    }
    rawNodes.forEach((node) => setHost('qbert', node.uuid, node))
    resMgrHosts.forEach((resMgrHost) => setHost('resmgr', resMgrHost.id, resMgrHost))

    // Convert it back to array form
    return Object.values(hostsById).map(combineHost)
  },
)

export const resMgrHostsSelector = createSelector(
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, DataKeys.ResMgrHosts]),
  (hosts) =>
    hosts.map((item) => ({
      ...item,
      ipPreview: getIpPreview(pathOr([], ['extensions', 'ip_address', 'data'], item)),
      networkInterfaces: getNetworkInterfaces(item),
      ovsBridges: pathOr([], ['extensions', 'interfaces', 'data', 'ovs_bridges'], item),
    })),
)

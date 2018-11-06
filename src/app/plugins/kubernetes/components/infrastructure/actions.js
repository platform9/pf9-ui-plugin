import { asyncMap, asyncFlatMap, tap, existentialGet } from 'core/fp'
import moment from 'moment'

export const loadClusters = async ({ context, setContext, reload }) => {
  if (!reload && context.clusters) { return context.clusters }
  const clusters = await context.apiClient.qbert.getClusters()
  setContext({ clusters })
  return clusters
}

export const loadCloudProviders = async ({ context, setContext, reload }) => {
  if (!reload && context.cloudProviders) { return context.cloudProviders }
  const cloudProviders = await context.apiClient.qbert.getCloudProviders()
  setContext({ cloudProviders })
  return cloudProviders
}

export const createCloudProvider = async ({ data, context, setContext }) => {
  const created = await context.apiClient.qbert.createCloudProvider(data)
  const existing = await context.apiClient.qbert.getCloudProviders()
  setContext({ cloudProviders: [ ...existing, created ] })
  return created
}

export const updateCloudProvider = async ({ data, context, setContext }) => {
  const { id } = data
  const existing = await context.apiClient.qbert.getCloudProviders()
  const updated = await context.apiClient.qbert.updateCloudProvider(id, data)
  const newList = existing.map(x => x.id === id ? x : updated)
  setContext({ routers: newList })
}

export const deleteCloudProvider = async ({ id, context, setContext }) => {
  await context.apiClient.qbert.deleteCloudProvider(id)
  const newCps = context.cloudProviders.filter(x => x.id !== id)
  setContext({ cloudProviders: newCps })
}

export const loadNodes = async ({ context, setContext, reload }) => {
  if (!reload && context.nodes) { return context.nodes }
  // TODO: Get nodes is not yet implemented
  // const nodes = await context.apiClient.qbert.getNodes()
  const nodes = []
  setContext({ nodes })
  return nodes
}

export const combineHost = host => {
  const { resmgrHost } = host
  let combined = {
    ...host,
    roles: resmgrHost.roles || [],
    roleStatus: resmgrHost.role_status,
    responding: resmgrHost.info.responding,
    hostname: resmgrHost.info.hostname,
    osInfo: resmgrHost.info.os_info,
    networks: [],
    vCenterIP:
      existentialGet(['extensions', 'hypervisor_details', 'data', 'vcenter_ip'], resmgrHost),
    supportRole: resmgrHost.roles.includes('pf9-support'),
    networkInterfaces:
      existentialGet(['extensions', 'interfaces', 'data', 'iface_ip'], resmgrHost),
    warnings: resmgrHost.message && resmgrHost.message.warn,
  }
  const { roles, roleStatus, responding, warnings } = combined
  if (roles.length === 0 || (roles.length === 1 && roles.includes('pf9-support'))) {
    combined.uiState = 'unauthorized'
  }

  if (responding) {
    if (['converging', 'retrying'].includes(roleStatus)) {
      combined.uiState = 'pending'
    }
    if (roleStatus === 'ok' && roles.length > 0) {
      combined.uiState = 'online'
    }
    if (warnings && warnings.length > 0) {
      // What is this for?
      combined.uiState = 'drifted'
    }
  }

  if (!combined.uiState && !responding) {
    combined.uiState = 'offline'
    const lastResponseTime = resmgrHost.info.last_response_time
    combined.lastResponse = moment.utc(lastResponseTime).fromNow(true)
    combined.lastResponseData = lastResponseTime && lastResponseTime.split(' ').join('T').concat('Z')
    // Even though the host is offline we may or may not have stats for it
    // depending on if the roles were authorized successfully in the past.
    combined.hasStats = roleStatus === 'ok'
  }

  const credentials = existentialGet(['extensions', 'hypervisor_details', 'data', 'credentials'], resmgrHost)
  if (credentials === 'invalid') {
    combined.uiState = 'invalid'
  }

  if (roleStatus === 'failed') {
    combined.uiState = 'error'
  }

  combined.roleData = {}

  // TODO: calculate aggregate totals across hosts and store it

  return combined
}

/*
 * The data model needed in the UI requires interwoven dependencies between
 * nodes, clusters, and namespaces.  Ideally the API would be more aligned
 * with the use case but in the meanwhile we are going to put the business
 * logic here.
 *
 * Also, inasmuch as possible, we `setContext` with a bare minimum version of
 * the data so the UI can display something sooner.  Then we make additional
 * API calls and use additional `setContext` calls to fill in the remaining
 * details.
 */
export const loadInfrastructure = async ({ context, setContext, reload }) => {
  if (reload || !context.namespaces || !context.clusters || !context.nodes) {
    const { qbert, resmgr } = context.apiClient

    // First `setContext` as the data arrive so we can at least render something.
    const [rawClusters, nodes] = await Promise.all([
      qbert.getClusters().then(tap(clusters => setContext({ clusters }))),
      qbert.getNodes().then(tap(nodes => setContext({ nodes }))),
    ])

    // Then fill out the derived data
    const clusters = rawClusters.map(cluster => {
      const nodesInCluster = nodes.filter(node => node.clusterUuid === cluster.uuid)
      const masterNodes = nodesInCluster.filter(node => node.isMaster === 1)
      const healthyMasterNodes = masterNodes.filter(node => node.status === 'ok' && node.api_responding === 1)
      return {
        ...cluster,
        nodes,
        masterNodes,
        healthyMasterNodes,
        hasMasterNode: healthyMasterNodes.length > 0,
        highlyAvailable: healthyMasterNodes.length > 2,
      }
    })
    setContext({ clusters })

    const masterNodeClusters = clusters.filter(x => x.hasMasterNode)
    asyncMap(masterNodeClusters, async cluster => {
      try {
        return {
          ...cluster,
          k8sVersion: await qbert.getKubernetesVersion(cluster.uuid),
        }
      } catch (err) {
        console.log(err)
        return cluster
      }
    }).then(clustersWithVersions => setContext({ clusters: clustersWithVersions }))

    asyncFlatMap(masterNodeClusters, cluster => qbert.getClusterNamespaces(cluster.uuid))
      .then(namespaces => setContext({ namespaces }))

    let hostsById = {}
    // We don't want to perform a check to see if the object exists yet for each type of host
    // so make a utility to make it cleaner.
    const setHost = (type, id, value) => {
      hostsById[id] = hostsById[id] || {}
      hostsById[id][type] = value
    }
    nodes.forEach(node => setHost('qbertHost', node.uuid, node))
    await Promise.all([
      resmgr.getHosts().then(
        resmgrHosts => {
          resmgrHosts.forEach(resmgrHost => setHost('resmgrHost', resmgrHost.id, resmgrHost))
          setContext({ resmgrHosts })
        }
      ),
      // TODO: include nova hosts here as well
    ])
    // Convert it back to array form
    const combinedHosts = Object.keys(hostsById).reduce(
      (accum, hostId) => {
        accum.push(hostsById[hostId])
        return accum
      },
      []
    ).map(combineHost)
    setContext({ combinedHosts })

    return { nodes, clusters, namespaces: [] }
  }

  return {
    nodes: context.nodes,
    namespaces: context.namespaces,
    clusters: context.clusters,
  }
}

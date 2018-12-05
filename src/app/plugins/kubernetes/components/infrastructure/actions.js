import { asyncMap, asyncFlatMap, tap, pathOrNull } from 'core/fp'
import { combineHost } from './combineHosts'
import { castFuzzyBool } from 'utils/misc'
import { pathOr } from 'ramda'

export const loadClusters = async ({ context, setContext, reload }) => {
  if (!reload && context.clusters) { return context.clusters }
  const clusters = await context.apiClient.qbert.getClusters()
  setContext({ clusters })
  return clusters
}

export const deleteCluster = async ({ id, context, setContext }) => {
  await context.apiClient.qbert.deleteCluster(id)
  const clusters = context.clusters.filter(x => x.uuid !== id)
  setContext({ clusters })
  // Force refresh using 'loadInfrastructure' since combinedHosts will still
  // have references to the deleted cluster.
  loadInfrastructure({ context, setContext, reload: true })
}

export const loadCloudProviders = async ({ context, setContext, reload }) => {
  if (!reload && context.cloudProviders) { return context.cloudProviders }
  const cloudProviders = await context.apiClient.qbert.getCloudProviders()
  setContext({ cloudProviders })
  return cloudProviders
}

export const createCloudProvider = ({ data, context }) =>
  context.apiClient.qbert.createCloudProvider(data)

export const updateCloudProvider = ({ id, data, context }) =>
  context.apiClient.qbert.updateCloudProvider(id, data)

export const deleteCloudProvider = async ({ id, context, setContext }) => {
  await context.apiClient.qbert.deleteCloudProvider(id)
  const newCps = context.cloudProviders.filter(x => x.uuid !== id)
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
  console.log('loadInfrastructure')
  if (reload || !context.namespaces || !context.clusters || !context.nodes) {
    console.log('loading infrastructure')
    const { qbert, resmgr } = context.apiClient

    // First `setContext` as the data arrive so we can at least render something.
    const [rawClusters, nodes] = await Promise.all([
      qbert.getClusters().then(tap(clusters => setContext({ clusters }))),
      qbert.getNodes().then(tap(nodes => setContext({ nodes }))),
    ])
    const qbertEndpoint = await qbert.baseUrl()

    // Then fill out the derived data
    const clusters = rawClusters.map(cluster => {
      const nodesInCluster = nodes.filter(node => node.clusterUuid === cluster.uuid)
      const masterNodes = nodesInCluster.filter(node => node.isMaster === 1)
      const healthyMasterNodes = masterNodes.filter(node => node.status === 'ok' && node.api_responding === 1)
      const clusterOk = nodesInCluster.length > 0 && cluster.status === 'ok'
      const dashboardLink =`${qbertEndpoint}/clusters/${cluster.uuid}/k8sapi/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:443/proxy/`
      const host = qbertEndpoint.match(/(.*?)\/qbert/)[1]
      const fuzzyBools = ['allowWorkloadsOnMaster', 'privileged', 'appCatalogEnabled'].reduce(
        (accum, key) => {
          accum[key] = castFuzzyBool(cluster[key])
          return accum
        },
        {}
      )
      return {
        ...cluster,
        nodes: nodesInCluster,
        masterNodes,
        healthyMasterNodes,
        hasMasterNode: healthyMasterNodes.length > 0,
        highlyAvailable: healthyMasterNodes.length > 2,
        links: {
          dashboard: clusterOk ? dashboardLink : null,
          // Rendering happens in <DownloadKubeConfigLink />
          kubeconfig: clusterOk ? { cluster }: null,
          // Rendering happens in <ClusterCLI />
          cli: clusterOk ? { host, cluster }: null,
        },
        ...fuzzyBools,
        hasVpn: castFuzzyBool(pathOr(false, ['cloudProperties', 'internalElb'], cluster)),
        hasLoadBalancer: castFuzzyBool(cluster.enableMetallb || pathOr(false, ['cloudProperties', 'enableLbaas'], cluster))
      }
    })
    setContext({ clusters })

    let _clusters = clusters.slice()
    asyncMap(_clusters, async cluster => {
      if (cluster.hasMasterNode) {
        try {
          const version = await qbert.getKubernetesVersion(cluster.uuid)
          return {
            ...cluster,
            version: version && version.gitVersion && version.gitVersion.substr(1),
          }
        } catch (err) {
          console.log(err)
          return cluster
        }
      } else {
        return cluster
      }
    }).then(clustersWithVersions => setContext({ clusters: clustersWithVersions }))

    const masterNodeClusters = clusters.filter(x => x.hasMasterNode)
    asyncFlatMap(masterNodeClusters, cluster => qbert.getClusterNamespaces(cluster.uuid))
      .then(namespaces => setContext({ namespaces }))

    let hostsById = {}
    // We don't want to perform a check to see if the object exists yet for each type of host
    // so make a utility to make it cleaner.
    const setHost = (type, id, value) => {
      hostsById[id] = hostsById[id] || {}
      hostsById[id][type] = value
    }
    nodes.forEach(node => setHost('qbert', node.uuid, node))
    await Promise.all([
      resmgr.getHosts().then(
        resmgrHosts => {
          resmgrHosts.forEach(resmgrHost => setHost('resmgr', resmgrHost.id, resmgrHost))
          setContext({ resmgrHosts })
        }
      ),
      // TODO: include nova hosts here as well
    ])

    // Convert it back to array form
    const combinedHosts = Object.values(hostsById).map(combineHost)
    const combinedHostsObj = combinedHosts.reduce(
      (accum, host) => {
        const id = pathOrNull('resmgr.id')(host) || pathOrNull('qbert.uuid')(host)
        accum[id] = host
        return accum
      },
      {}
    )

    setContext({ combinedHosts })

    // associate nodes with the combinedHost entry
    const nodesCombined = nodes.map(node => ({ ...node, combined: combinedHostsObj[node.uuid] }))
    setContext({ nodes: nodesCombined })

    return { nodes: nodesCombined, clusters, namespaces: [] }
  }

  return {
    nodes: context.nodes,
    namespaces: context.namespaces,
    clusters: context.clusters,
  }
}

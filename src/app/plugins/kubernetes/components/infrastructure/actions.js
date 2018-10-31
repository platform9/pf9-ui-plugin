import { asyncMap } from 'core/fp'

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
    // First `setContext` as the data arrive so we can at least render something.
    const qbert = context.apiClient.qbert
    const [rawNodes, rawClusters] = await Promise.all([
      qbert.getClusters().then(clusters => setContext({ clusters })),
      qbert.getNodes().then(nodes => setContext({ nodes })),
    ])

    // Then fill out the derived data
    const clusters = rawClusters.map(cluster => {
      const nodesInCluster = rawNodes.filter(node => node.clusterId === cluster.id)
      const masterNodes = nodesInCluster.filter(node => node.isMaster === 1)
      const healthyMasterNodes = masterNodes.filter(node => node.status === 'ok')
      return {
        ...cluster,
        nodes,
        masterNodes,
        healthyMasterNodes,
        hasMasterNode: healthyMasterNodes.length > 0,
        highlyAvailable: healthyMasterNodes.length > 2,
      }
    })
    console.log(1)
    setContext({ clusters })

    asyncMap(clusters.filter(x => x.hasMasterNode), async cluster => ({
      ...cluster,
      k8sVersion: await qbert.getKubernetesVersion(cluster.uuid),
    })).then(clustersWithVersions => setContext({ clusters: clustersWithVersions })).then(x => console.log(2))

    console.log(3)

    const nodes = rawNodes

    return { nodes, clusters, namespaces: [] }
  }

  return {
    nodes: context.nodes,
    namespaces: context.namespaces,
    clusters: context.clusters,
  }
}

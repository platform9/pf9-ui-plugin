import context from '../../context'
import Cluster from '../../models/qbert/Cluster'

const mapCluster = cluster => ({
  name: cluster.name,
  projectId: cluster.projectId,
  tags: Object.keys(cluster.tags),
  uuid: cluster.uuid,
})

export const getAppbertClusters = (req, res) => {
  const clusters = Cluster.list({ context })
  const data = clusters.map(mapCluster)
  return res.send(data)
}

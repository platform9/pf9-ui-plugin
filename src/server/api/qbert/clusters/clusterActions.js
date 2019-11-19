import context from '../../../context'
import Cluster from '../../../models/qbert/Cluster'

export const getClusters = (req, res) => {
  const clusters = Cluster.list({ context })
  return res.send(clusters)
}

export const postCluster = (req, res) => {
  const cluster = { ...req.body }
  const newCluster = Cluster.create({ data: cluster, context })
  res.status(201).send(newCluster)
}

export const putCluster = (req, res) => {
  const { clusterId } = req.params
  const updatedCluster = Cluster.update({ id: clusterId, data: req.body, context })
  res.status(200).send(updatedCluster)
}

export const deleteCluster = (req, res) => {
  // TODO: account for tenancy
  const { clusterId } = req.params
  console.log('Attempting to delete clusterId: ', clusterId)
  // this should throw an error if it doesn't exist
  Cluster.delete({ id: clusterId, context })
  res.status(200).send({})
}

export const upgradeCluster = (req, res) => {
  const { clusterId } = req.params
  const upgradedCluster = Cluster.update({ id: clusterId, data: { canUpgrade: false }, context })
  res.status(200).send(upgradedCluster)
}

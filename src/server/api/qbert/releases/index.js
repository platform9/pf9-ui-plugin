import context from '../../../context'
import Release from '../../../models/monocular/Release'

export const getReleases = (req, res) => {
  const { namespace, clusterId } = req.params
  const releases = Release.list({ context, config: { clusterId, namespace } })
  return res.send(releases)
}

export const getRelease = (req, res) => {
  const { namespace, clusterId } = req.params
  const { releaseName } = req.params
  const release = Release.findByName({ name: releaseName, context, config: { clusterId, namespace } })
  return res.send(release)
}

export const deleteRelease = () => {
  // TODO
}

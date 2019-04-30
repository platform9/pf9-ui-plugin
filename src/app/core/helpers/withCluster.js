import { pathOr } from 'ramda'
import { loadClusters } from 'k8s/components/infrastructure/actions'

export const withCluster = cb => async ({ context, params = {}, ...rest }) => {
  const clusters = (await loadClusters({ context, ...rest })).filter(x => x.hasMasterNode)
  const { clusterId = pathOr('__all__', [0, 'uuid'], clusters) } = params
  return cb({ params: { ...params, clusterId }, clusters, context, ...rest })
}

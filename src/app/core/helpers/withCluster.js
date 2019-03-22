import { pathOr } from 'ramda'

export const withCluster = cb => ({ context, params = {}, ...rest }) => {
  const clusters = (context.clusters || []).filter(x => x.hasMasterNode)
  const { clusterId = pathOr('__all__', [0, 'uuid'], clusters) } = params
  return cb({ params: { ...params, clusterId }, context, ...rest })
}

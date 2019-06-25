import { compose, pathOr } from 'ramda'
import withDataLoader from 'core/hocs/withDataLoader'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import withParams from 'core/hocs/withParams'
import withDataMapper from 'core/hocs/withDataMapper'
import { withAppContext } from 'core/AppContext'

export const mapByClusterId = contextKey => ({ context = {}, params: { clusterId } }) => {
  return pathOr([], [contextKey, clusterId], context)
}

export default (key, loaderFn) => compose(
  withAppContext,
  // First load the clusters to be able to access `context.clusters` from the withParams HoC
  withDataLoader({ clusters: loadClusters }),
  // Provide a "setParams" function and a "params" object in the props
  withParams({
    clusterId: pathOr('__all__', ['context', 'clusters', 0, 'uuid']),
  }),
  // Load the data (the loader will receive a `params.clusterId` prop)
  withDataLoader({ [key]: loaderFn }),
  // Map data from context to the "data" prop to use it in the view
  withDataMapper({
    clusters: pathOr([], ['context', 'clusters']),
    [key]: mapByClusterId(key),
  }),
)

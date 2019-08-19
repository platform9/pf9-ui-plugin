import { compose, pathOr, pipe, identity, filter } from 'ramda'
import withDataLoader from 'core/hocs/withDataLoader'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import withParams from 'core/hocs/withParams'
import withDataMapper from 'core/hocs/withDataMapper'
import { withAppContext } from 'core/AppProvider'
import { dataKey } from 'core/helpers/createContextLoader'

export default (key, loaderFn, options = {}) => {
  const {
    onlyMasterNodeClusters = false
  } = options

  return compose(
    withAppContext,
    // First load the clusters to be able to access `context.clusters` from the withParams HoC
    withDataLoader({ clusters: loadClusters }),
    // Provide a "setParams" function and a "params" object in the props
    withParams({
      clusterId: pipe(
        pathOr([], [dataKey, 'clusters']),
        onlyMasterNodeClusters ? filter(x => x.hasMasterNode) : identity,
        pathOr('__all__', [0, 'uuid']),
      ),
    }),
    // Load the data (the loader will receive a `params.clusterId` prop)
    withDataLoader({ [key]: loaderFn }),
    // Map data from context to the "data" prop to use it in the view
    withDataMapper({
      clusters:
        pipe(
          pathOr([], [dataKey, 'clusters']),
          onlyMasterNodeClusters ? filter(x => x.hasMasterNode) : identity,
        ),
      [key]: pathOr([], [dataKey, key]),
    }),
  )
}

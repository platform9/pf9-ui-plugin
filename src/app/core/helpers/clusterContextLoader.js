import { pathOr, prop, groupBy, assocPath, flatten, omit, path } from 'ramda'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import contextLoader from 'core/helpers/contextLoader'
import { ensureArray } from 'utils/fp'

// Returns a contextLoaded function contextualized by selected cluster (given by clusterId param)
// Use is the same as in "contextLoader" but it also receives an additional clusterId param and
// clusters that are passed as arguments to the loaderFn callback
// Context will be indexed by "clusterId" and also have an "__all__" prop with all the items:
// {
//   "ba39856e-2580-4a72-a247-2c8e79004e2b": [
//     { "id": "stable/capacitor", },
//     { "id": "stable/pixel", },
//     { "id": "stable/card", }
//   ],
//   "68f95f1d-875a-46a1-a1c7-e75717a49793": []
//   "__all__": [
//     { "id": "stable/capacitor", },
//     { "id": "stable/pixel", },
//     { "id": "stable/card", }
//   ],
// }
const clusterContextLoader = (key, loaderFn, filterMasterNodes = true, defaultValue = []) =>
  async ({ getContext, setContext, params = {}, ...rest }) => {
    const keyPath = ensureArray(key)
    const clusters = (await loadClusters({ getContext, setContext, ...rest, reload: false }))
      .filter(cluster => !filterMasterNodes || cluster.hasMasterNode)
    const { clusterId = pathOr('__all__', [0, 'uuid'], clusters) } = params
    const loadedData = await contextLoader([...keyPath, clusterId], loaderFn, defaultValue)(
      { getContext, setContext, params: { ...params, clusterId }, clusters, ...rest },
    )
    if (clusterId === '__all__') {
      // update all cluster indexed positions in bulk
      await setContext(context => {
        assocPath(keyPath, {
          ...groupBy(prop('clusterId'), loadedData),
          '__all__': loadedData,
        }, context)
      })
    } else {
      // update "__all__" key
      await setContext(context =>
        assocPath(
          [...keyPath, '__all__'],
          flatten(Object.values(omit(['__all__'], path(keyPath, context)))),
          context),
      )
    }
    return loadedData
  }

export default clusterContextLoader

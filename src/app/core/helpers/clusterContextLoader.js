import { prop, groupBy, assocPath, path } from 'ramda'
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
const clusterContextLoader = (key, loaderFn) => {
  const arrContextPath = ensureArray(key)
  const contextGetter = (context, { params: { clusterId } = {} }) =>
    path([...arrContextPath, clusterId || '__all__'], context)
  const contextSetter = (context, data, { params: { clusterId } = {} }) => {
    // update all cluster indexed positions in bulk
    if (!clusterId || clusterId === '__all__') {
      return assocPath(arrContextPath, {
        ...groupBy(prop('clusterId'), data),
        '__all__': data,
      }, context)
    }
    return assocPath([...arrContextPath, clusterId], data, context)
  }

  return contextLoader(key, loaderFn, {
    contextGetter,
    contextSetter,
  })
}

export default clusterContextLoader

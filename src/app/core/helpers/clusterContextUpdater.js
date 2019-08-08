import { assocPath, groupBy, prop, pipe, hasPath, omit, flatten, path } from 'ramda'
import contextUpdater from 'core/helpers/contextUpdater'
import { ensureArray } from 'utils/fp'

// Returns a contextUpdater function contextualized by selected cluster (given by clusterId param)
const clusterContextUpdater = (key, updaterFn, options) => {
  const keyPath = ensureArray(key)
  const contextSetter = (context, output, { params: { clusterId } }) => {
    const arrContextPath = [...keyPath, clusterId || '__all__']
    if (!clusterId || clusterId === '__all__') {
      // update all cluster indexed positions in bulk
      return assocPath(keyPath, {
        ...groupBy(prop('clusterId'), output),
        '__all__': output,
      }, context)
    }
    return pipe(
      assocPath(arrContextPath, output),
      context => {
        // update "__all__" key if it exists
        if (hasPath([...keyPath, '__all__'])) {
          return assocPath(
            [...keyPath, '__all__'],
            flatten(Object.values(omit(['__all__'], path(keyPath, context)))),
          )
        }
        return context
      },
    )(context)
  }

  // updaterFn will receive "clusters" and "clusterId" in the "params" object
  return contextUpdater(key, updaterFn, { ...options, contextSetter })
}

export default clusterContextUpdater

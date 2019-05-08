import { path, flatten, omit, assocPath, groupBy, prop } from 'ramda'
import contextUpdater from 'core/helpers/contextUpdater'
import { ensureArray } from 'utils/fp'

// Returns a contextUpdater function contextualized by selected cluster (given by clusterId param)
const clusterContextUpdater = (key, updaterFn, returnLast = false) =>
  async ({ setContext, data = {}, params = data, ...rest }) => {
    const keyPath = ensureArray(key)
    const { clusterId } = params

    // updaterFn will receive "clusters" and "clusterId" in the "params" object
    const updatedData = await contextUpdater([...keyPath, clusterId || '__all__'], updaterFn, returnLast)(
      { params: { ...params, clusterId }, data, ...rest },
    )

    if (!clusterId) {
      // update all cluster indexed positions in bulk
      await setContext(ctx => {
        assocPath(keyPath, {
          ...groupBy(prop('clusterId'), updatedData),
          '__all__': updatedData,
        }, ctx)
      })
    } else {
      // update "__all__" key
      await setContext(ctx =>
        assocPath(
          [...keyPath, '__all__'],
          flatten(Object.values(omit(['__all__'], path(keyPath, ctx)))),
          ctx),
      )
    }

    return updatedData
  }

export default clusterContextUpdater

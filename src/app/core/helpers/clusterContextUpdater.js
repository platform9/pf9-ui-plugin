import { loadClusters } from 'k8s/components/infrastructure/actions'
import { pathOr } from 'ramda'
import contextUpdater from 'core/helpers/contextUpdater'

// Returns a contextUpdater function contextualized by selected cluster (given by clusterId param)
const clusterContextUpdater = (key, updaterFn, returnLast = false) =>
  async ({ context, params = {}, ...rest }) => {
    const clusters = (await loadClusters({ context, params, ...rest, reload: false }))
      .filter(cluster => cluster.hasMasterNode)
    const { clusterId = pathOr('__all__', [0, 'uuid'], clusters) } = params

    // updaterFn will receive "clusters" and "clusterId" in "params" object
    return contextUpdater([key, clusterId], updaterFn, returnLast)(
      { context, params: { ...params, clusterId }, clusters, ...rest },
    )
  }

export default clusterContextUpdater

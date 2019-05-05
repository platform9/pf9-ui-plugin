import { pathOr, chain } from 'ramda'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import contextLoader from 'core/helpers/contextLoader'

// Returns a contextLoaded function contextualized by selected cluster (given by clusterId param)
const clusterContextLoader = (key, loaderFn, defaultValue = []) =>
  async ({ context, params = {}, ...rest }) => {
    const clusters = (await loadClusters({ context, params, ...rest, reload: false }))
      .filter(cluster => cluster.hasMasterNode)
    const { clusterId = pathOr('__all__', [0, 'uuid'], clusters) } = params

    // loaderFn will receive "clusters" and "clusterId" in "params" object
    const data = await contextLoader([key, clusterId], loaderFn, defaultValue)(
      { context, params: { ...params, clusterId }, clusters, ...rest },
    )
    return clusterId === '__all__'
      ? chain(([clusterId, values]) => values.map(value => ({
        ...value,
        clusterId,
      })), Object.entries(data))
      : data[clusterId]
  }

export default clusterContextLoader

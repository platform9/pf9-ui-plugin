import ApiClient from 'api-client/ApiClient'
import { tryCatchAsync } from 'utils/async'

const { qbert } = ApiClient.getInstance()

const determineVpc = (cluster) => {
  const choices = ['Public', 'Private']
  const filteredChoices = choices.filter((choice) => {
    if (choice === 'Public') {
      return cluster.pf9Registered
    } else if (choice === 'Private') {
      return cluster.isPrivateAPI
    }
  })
  return filteredChoices.length ? filteredChoices.join(' + ') : 'None'
}

export const discoverExternalClusters = async ({
  provider,
  cloudProviderId,
  regions = undefined,
}) => {
  const body = {
    provider,
    cloudProviderID: cloudProviderId,
    providerDetails: {
      regions,
    },
  }

  const data = await qbert.discoverExternalClusters(body)

  const mappedData = data.map((region) => {
    const mappedClusters = region.clusters.map((cluster) => ({
      ...cluster,
      vpc: determineVpc(cluster),
    }))
    return {
      ...region,
      clusters: mappedClusters,
    }
  })

  return mappedData
}

export const registerExternalClusters = async ({ cloudProviderId, clusters }) => {
  const registerExternalClusterPromises = clusters.map((cluster) => {
    const body = {
      id: cluster.id,
      provider: 'eks',
      cloudProviderID: cloudProviderId,
      providerDetails: {
        region: cluster.region,
      },
    }
    return qbert.registerExternalCluster(body)
  })

  // Resolve tenant and user/roles operation promises and filter out null responses
  await tryCatchAsync(
    () => Promise.all(registerExternalClusterPromises),
    (err) => {
      console.warn(err.message)
      return err
    },
  )(null)

  // I don't think this works below... either that or it takes some time for the cluster to
  // be returned from the sunpike API after the API call finishes
  // importedClusterActions.invalidateCache()
  return clusters
}

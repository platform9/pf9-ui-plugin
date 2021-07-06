import { createSelector } from 'reselect'
import { mergeLeft, pipe } from 'ramda'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { determineProfileResources } from './helpers'

const determineProfileAction = (profile) => {
  const status = profile.status.phase
  if (status === 'published') {
    return 'deploy'
  } else if (status === 'draft') {
    return 'publish'
  }
  return 'none'
}

export const rbacProfilesSelector = createSelector(
  [
    getDataSelector(DataKeys.RbacProfiles),
    getDataSelector(DataKeys.RbacProfileBindings),
    getDataSelector(DataKeys.Clusters),
  ],
  (rbacProfiles, profileBindings, clusters) => {
    return rbacProfiles.map((profile) => {
      const matchingBindings = profileBindings.filter((binding) => {
        return binding.spec.profileRef.split('default/')[1] === profile.metadata.name
      })
      const bindingClusters = matchingBindings.map((binding) => {
        return binding.spec.clusterRef
      })
      const matchingClusters = clusters.filter((cluster) => {
        return bindingClusters.includes(cluster.uuid)
      })
      const profileResources = determineProfileResources(profile)
      return {
        ...profile,
        action: determineProfileAction(profile),
        id: profile.metadata.uid,
        name: profile.metadata.name,
        clusters: matchingClusters,
        bindings: matchingBindings,
        ...profileResources,
      }
    })
    return rbacProfiles
  },
)

export const makeRbacProfilesSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [rbacProfilesSelector, (_, params) => mergeLeft(params, defaultParams)],
    (rbacProfiles, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(rbacProfiles)
    },
  )
}

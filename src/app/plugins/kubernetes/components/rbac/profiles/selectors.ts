import { createSelector } from 'reselect'
import { mergeLeft, pipe } from 'ramda'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { determineProfileResources } from './helpers'
import { arrayIfEmpty } from 'utils/fp'

export const rbacProfileBindingsSelector = createSelector(
  [getDataSelector(DataKeys.RbacProfileBindings)],
  (profileBindings) => {
    return arrayIfEmpty(
      profileBindings.map((binding) => {
        return {
          ...binding,
          id: binding.metadata.uid,
          name: binding.metadata.name,
        }
      }),
    )
  },
)

export const makeRbacProfileBindingsSelector = (
  defaultParams = {
    orderBy: 'name',
    orderDirection: 'asc',
  },
) => {
  return createSelector(
    [rbacProfileBindingsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (rbacProfileBindings, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }), arrayIfEmpty)(rbacProfileBindings)
    },
  )
}

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
    rbacProfileBindingsSelector,
    getDataSelector(DataKeys.Clusters),
  ],
  (rbacProfiles, profileBindings, clusters) => {
    return arrayIfEmpty(
      rbacProfiles.map((profile) => {
        const matchingBindings = profileBindings.filter((binding) => {
          const isDryRun = !!binding.spec.dryRun
          const bindingMatches =
            binding.spec.profileRef.split('default/')[1] === profile.metadata.name
          return !isDryRun && bindingMatches
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
      }),
    )
  },
)

export const makeRbacProfilesSelector = (
  defaultParams = {
    orderBy: 'name',
    orderDirection: 'asc',
  },
) => {
  return createSelector(
    [rbacProfilesSelector, (_, params) => mergeLeft(params, defaultParams)],
    (rbacProfiles, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }), arrayIfEmpty)(rbacProfiles)
    },
  )
}

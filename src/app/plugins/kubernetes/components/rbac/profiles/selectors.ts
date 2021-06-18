import { createSelector } from 'reselect'
import { mergeLeft, pipe } from 'ramda'
import createSorter from 'core/helpers/createSorter'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'

export const rbacProfilesSelector = createSelector(
  [getDataSelector(DataKeys.RbacProfiles)],
  (rbacProfiles) => {
    console.log(rbacProfiles, 'rbac profiles in selector')
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

import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { pipe, map } from 'ramda'
import { filterIf } from 'utils/fp'

const { keystone } = ApiClient.getInstance()

export const mngmRolesCacheKey = 'managementRoles'
export const mngmRoleActions = createCRUDActions(mngmRolesCacheKey, {
  listFn: async () => {
    return keystone.getRoles()
  },
  dataMapper: (roles, params) => pipe(
    filterIf(!params.allRoles, role => ['admin', '_member_'].includes(role.name)),
    map(role => ({
      ...role,
      name: role.displayName || role.name,
    })),
  )(roles),
  defaultOrderBy: 'name',
})

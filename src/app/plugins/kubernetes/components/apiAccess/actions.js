import createCRUDActions from 'core/helpers/createCRUDActions'

export const apiAccessCacheKey = 'apiAccess'

const apiAccessActions = createCRUDActions(apiAccessCacheKey, {
  listFn: async (params, loadFromContext) => {
    const apiAccess = await loadFromContext(apiAccessCacheKey)

    return apiAccess
  }
})

export default apiAccessActions

import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'
import { mapAsync } from 'utils/async'

const { qbert } = ApiClient.getInstance()

export const apiAccessCacheKey = 'apiAccess'

const apiAccessActions = createCRUDActions(apiAccessCacheKey, {
    listFn: async(params, loadFromContext) => {
        const apiAccess = await loadFromContext(apiAccessCacheKey)
        debugger

        return apiAccess
    }
})

export default apiAccessActions
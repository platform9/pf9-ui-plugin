import express from 'express'

// Cloud Providers
import getCloudProviders from './getCloudProviders'
import postCloudProvider from './postCloudProvider'
import putCloudProvider from './putCloudProvider'
import deleteCloudProvider from './deleteCloudProvider'
import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2/:tenantId/cloudProviders', tokenValidator, getCloudProviders)
router.post('/v2/:tenantId/cloudProviders', tokenValidator, postCloudProvider)
router.put('/v2/:tenantId/cloudProviders/:cloudProviderId', tokenValidator, putCloudProvider)
router.delete('/v2/:tenantId/cloudProviders/:cloudProviderId', tokenValidator, deleteCloudProvider)

export default router

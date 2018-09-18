import express from 'express'

// Flavors
import getFlavors from './getFlavors'
import postFlavor from './postFlavor'
import deleteFlavor from './deleteFlavor'
import getSshKeys from './getSshKeys'
import postSshKey from './postSshKey'
import deleteSshKey from './deleteSshKey'

// Hypervisors
import getHypervisors from './getHypervisors'

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2.1/:tenantId/flavors/detail', tokenValidator, getFlavors)
router.post('/v2.1/:tenantId/flavors', tokenValidator, postFlavor)
router.delete('/v2.1/:tenantId/flavors/:flavorId', tokenValidator, deleteFlavor)

// Hypervisors
router.get('/v2.1/:tenantId/os-hypervisors/detail', tokenValidator, getHypervisors)

// SSH Keys
router.get('/v2.1/:tenantId/os-keypairs', tokenValidator, getSshKeys)
router.post('/v2.1/:tenantId/os-keypairs', tokenValidator, postSshKey)
router.delete('/v2.1/:tenantId/os-keypairs/:sshKeyId', tokenValidator, deleteSshKey)

export default router

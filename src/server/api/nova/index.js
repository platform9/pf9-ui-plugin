import express from 'express'

// Flavors
import getFlavors from './getFlavors'
import postFlavor from './postFlavor'
import deleteFlavor from './deleteFlavor'

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2.1/:tenantId/flavors/detail', tokenValidator, getFlavors)
router.post('/v2.1/:tenantId/flavors', tokenValidator, postFlavor)
router.delete('/v2.1/:tenantId/flavors/:flavorId', tokenValidator, deleteFlavor)

export default router

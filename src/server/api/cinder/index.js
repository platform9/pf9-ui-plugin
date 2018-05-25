import express from 'express'

// Volumes
import getVolumes from './getVolumes'
import postVolume from './postVolume'
import deleteVolume from './deleteVolume'

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2.1/:tenantId/volumes/detail', tokenValidator, getVolumes)
router.post('/v2.1/:tenantId/volumes', tokenValidator, postVolume)
router.delete('/v2.1/:tenantId/volumes/:volumeId', tokenValidator, deleteVolume)

export default router

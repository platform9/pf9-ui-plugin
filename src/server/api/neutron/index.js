import express from 'express'

// Networks
import getNetworks from './getNetworks'
import postNetwork from './postNetwork'
import deleteNetwork from './deleteNetwork'

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2.0/networks', tokenValidator, getNetworks)
router.post('/v2.0/networks', tokenValidator, postNetwork)
router.delete('/v2.0/networks/:networkId', tokenValidator, deleteNetwork)

export default router

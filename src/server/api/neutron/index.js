import express from 'express'

// Networks
import getNetworks from './getNetworks'
import postNetwork from './postNetwork'
import deleteNetwork from './deleteNetwork'

// Routers
import getRouters from './getRouters'
import postRouter from './postRouter'
import deleteRouter from './deleteRouter'

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2.0/networks', tokenValidator, getNetworks)
router.post('/v2.0/networks', tokenValidator, postNetwork)
router.delete('/v2.0/networks/:networkId', tokenValidator, deleteNetwork)

router.get('/v2.0/routers', tokenValidator, getRouters)
router.post('/v2.0/routers', tokenValidator, postRouter)
router.delete('/v2.0/routers/:routerId', tokenValidator, deleteRouter)

export default router

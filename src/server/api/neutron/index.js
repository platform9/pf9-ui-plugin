import express from 'express'

// Networks
import getNetworks from './getNetworks'
import postNetwork from './postNetwork'
import deleteNetwork from './deleteNetwork'

// Routers
import getRouters from './getRouters'
import postRouter from './postRouter'
import deleteRouter from './deleteRouter'

// Floating IPs
import getFloatingIps from './getFloatingIps'
import postFloatingIp from './postFloatingIp'
import deleteFloatingIp from './deleteFloatingIp'

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2.0/networks', tokenValidator, getNetworks)
router.post('/v2.0/networks', tokenValidator, postNetwork)
router.delete('/v2.0/networks/:networkId', tokenValidator, deleteNetwork)

router.get('/v2.0/routers', tokenValidator, getRouters)
router.post('/v2.0/routers', tokenValidator, postRouter)
router.delete('/v2.0/routers/:routerId', tokenValidator, deleteRouter)

router.get('/v2.0/floatingips', tokenValidator, getFloatingIps)
router.post('/v2.0/floatingips', tokenValidator, postFloatingIp)
router.delete('/v2.0/floatingips/:floatingIpId', tokenValidator, deleteFloatingIp)

export default router

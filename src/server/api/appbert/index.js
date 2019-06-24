import express from 'express'

import { getAppbertClusters } from './clusters'
import { tokenValidator } from '../../middleware'

const router = express.Router()

const version = 'v1'

router.get(`/${version}/clusters`, tokenValidator, getAppbertClusters)

export default router

import express from 'express'
import getResMgrHosts from './getResMgrHosts'
import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v1/hosts', tokenValidator, getResMgrHosts)

export default router

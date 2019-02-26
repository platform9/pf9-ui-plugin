import express from 'express'
import { tokenValidator } from '../../middleware'
import getRepositories from './repositories/getRepositories'

const router = express.Router()
const version = 'v1'

router.get(`/${version}/repos`, tokenValidator, getRepositories)

export default router

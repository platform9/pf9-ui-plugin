import express from 'express'

import postToken from './postToken'
// Projects
import getProjects from './getProjects'
import postProject from './postProject'
import deleteProject from './deleteProject'
// Regions
import getRegions from './getRegions'
// Catalog
import getCatalog from './getCatalog'
// Users
import getUsers from './getUsers'
import postUser from './postUser'
import deleteUser from './deleteUser'
import getRoles from './getRoles'
import getGroups from './getGroups'
import getTenantUsers from './getTenantUsers'
import getMappings from './getMappings'

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.post('/v3/auth/tokens', postToken)

// Everything past this point requires authentication

router.get('/v3/auth/projects', tokenValidator, getProjects)
router.get('/v3/projects', tokenValidator, getProjects)
router.post('/v3/projects', tokenValidator, postProject)
router.delete('/v3/projects/:projectId', tokenValidator, deleteProject)

router.get('/v3/regions', tokenValidator, getRegions)

router.get('/v3/auth/catalog', tokenValidator, getCatalog)

router.get('/v3/users', tokenValidator, getUsers)
router.post('/v3/users', tokenValidator, postUser)
router.delete('/v3/users/:userId', tokenValidator, deleteUser)

router.get('/v3/PF9-KSADM/all_tenants_all_users', tokenValidator, getTenantUsers)
router.get('/v3/roles', tokenValidator, getRoles)
router.get('/v3/groups', tokenValidator, getGroups)

router.get('/v3/OS-FEDERATION/mappings', tokenValidator, getMappings)

export default router

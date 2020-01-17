import express from 'express'
import getCredentials from './getCredentials'

import postToken from './postToken'
// Projects
import getProjects from './getProjects'
import postProject from './postProject'
import putProject from './putProject'
import deleteProject from './deleteProject'
// Regions
import getRegions from './getRegions'
// Catalog
import getCatalog from './getCatalog'
// Users
import getUsers from './getUsers'
import postUser from './postUser'
import patchUser from './patchUser'
import deleteUser from './deleteUser'
import getRoles from './getRoles'
import addUserRole from './addUserRole'
import deleteUserRole from './deleteUserRole'
import getRoleAssignments from './getRoleAssignments'
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
router.put('/v3/projects/:projectId', tokenValidator, putProject)
router.delete('/v3/projects/:projectId', tokenValidator, deleteProject)

router.get('/v3/regions', tokenValidator, getRegions)

router.get('/v3/auth/catalog', tokenValidator, getCatalog)

router.get('/v3/users', tokenValidator, getUsers)
router.post('/v3/users', tokenValidator, postUser)
router.patch('/v3/users/:userId', tokenValidator, patchUser)
router.delete('/v3/users/:userId', tokenValidator, deleteUser)

router.get('/v3/PF9-KSADM/all_tenants_all_users', tokenValidator, getTenantUsers)
router.get('/v3/roles', tokenValidator, getRoles)
router.get('/v3/groups', tokenValidator, getGroups)

router.put('/v3/projects/:tenantId/users/:userId/roles/:roleId', tokenValidator, addUserRole)
router.delete('/v3/projects/:tenantId/users/:userId/roles/:roleId', tokenValidator, deleteUserRole)

router.get('/v3/role_assignments', tokenValidator, getRoleAssignments)
router.get('/v3/credentials', tokenValidator, getCredentials)

router.get('/v3/OS-FEDERATION/mappings', tokenValidator, getMappings)

export default router

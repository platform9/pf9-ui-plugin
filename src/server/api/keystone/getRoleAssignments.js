import { filter, map, pick, pipe } from 'ramda'
import User from '../../models/openstack/User'

const getRoleAssignments = (req, res) => {
  const { query } = req
  const projectId = query['scope.project.id']
  const userId = query['user.id']
  const users = User.getCollection()
  const mapRoleAssignments = map(user => {
    const { roles = [] } = user
    const roleTenantPair = roles[0] || {}
    return {
      scope: { project: roleTenantPair.tenant.asJson() },
      role: roleTenantPair.role.asJson(),
      user: pick(['domain', 'id', 'name'], user.asJson()),
    }
  })
  const filterRoleAssignments = filter(({ scope, user }) =>
    (projectId ? projectId === scope.project.id : true) &&
    (userId ? userId === user.id : true),
  )
  const roleAssignments = pipe(
    mapRoleAssignments,
    filterRoleAssignments,
  )(users)
  return res.send({ role_assignments: roleAssignments })
}

export default getRoleAssignments

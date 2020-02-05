import { filter, flatten, map, pick, pipe } from 'ramda'
import User from '../../models/openstack/User'

const getRoleAssignments = (req, res) => {
  const { query } = req
  const projectId = query['scope.project.id']
  const userId = query['user.id']
  const users = User.getCollection()
  const mapRoleAssignments = map((user) => {
    const { roles = [] } = user
    return roles.map(({ tenant, role }) => ({
      scope: { project: tenant.asJson() },
      role: role.asJson(),
      user: pick(['domain', 'id', 'name'], user.asJson()),
    }))
  })
  const filterRoleAssignments = filter(
    ({ scope, user }) =>
      (!projectId || projectId === scope.project.id) && (!userId || userId === user.id),
  )
  const roleAssignments = pipe(mapRoleAssignments, flatten, filterRoleAssignments)(users)
  return res.send({ role_assignments: roleAssignments })
}

export default getRoleAssignments

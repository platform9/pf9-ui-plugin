export const determineProfileResources = (profile) => {
  const spec = profile?.spec
  if (!spec) {
    return {
      roles: [],
      roleBindings: [],
      clusterRoles: [],
      clusterRoleBindings: [],
    }
  }
  const roles =
    spec.namespaceScopedResources?.filter((resource) => resource.includes('/roles/')) || []
  const roleBindings =
    spec.namespaceScopedResources?.filter((resource) => resource.includes('/rolebindings/')) || []
  const clusterRoles =
    spec.clusterScopedResources?.filter((resource) => resource.includes('clusterroles/')) || []
  const clusterRoleBindings =
    spec.clusterScopedResources?.filter((resource) => resource.includes('clusterrolebindings/')) ||
    []
  return {
    roles,
    roleBindings,
    clusterRoles,
    clusterRoleBindings,
  }
}

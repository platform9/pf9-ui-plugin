// import ApiClient from 'api-client/ApiClient'
// import createContextLoader from 'core/helpers/createContextLoader'
// import createCRUDActions from 'core/helpers/createCRUDActions'
// import { ActionDataKeys } from 'k8s/DataKeys'

// const { keystone } = ApiClient.getInstance()

// export const mngmGroupActions = createCRUDActions(ActionDataKeys.ManagementGroups, {
//   listFn: async () => {
//     const [groups] = await Promise.all([
//       keystone.getGroups(),
//       // Fetch dependent caches
//       mngmGroupMappingActions.list(),
//     ])
//     return groups
//   },
//   entityName: 'Group',
// })

// export const mngmGroupMappingActions = createContextLoader(
//   ActionDataKeys.ManagementGroupsMappings,
//   async () => keystone.getGroupMappings(),
// )

import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import {
  makeRbacProfileBindingsSelector,
  makeRbacProfilesSelector,
  rbacProfileBindingsSelector,
  rbacProfilesSelector,
} from './selectors'
import uuid from 'uuid'
import { trackEvent } from 'utils/tracking'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'metadata.name'

export const rbacProfileActions = createCRUDActions(ActionDataKeys.RbacProfiles, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get rbac profiles')
    const [profiles] = await Promise.all([
      qbert.getRbacProfiles(),
      // Make sure to fetch dependent caches
      clusterActions.list(),
      // profile bindings need to be refreshed alongside profiles
      rbacProfileBindingsActions.list({}, true),
    ])
    return profiles
  },
  createFn: async (data) => {
    const roles = Object.values(data.roles).map(
      ({ name, namespace }) => `${namespace}/roles/${name}`,
    )
    const roleBindings = Object.values(data.roleBindings).map(
      ({ name, namespace }) => `${namespace}/rolebindings/${name}`,
    )
    const clusterRoles = Object.values(data.clusterRoles).map(({ name }) => `clusterroles/${name}`)
    const clusterRoleBindings = Object.values(data.clusterRoleBindings).map(
      ({ name }) => `clusterrolebindings/${name}`,
    )
    const body = {
      apiVersion: 'sunpike.platform9.com/v1alpha2',
      kind: 'ClusterProfile',
      metadata: { name: data.profileName },
      spec: {
        cloneFrom: data.baseCluster,
        namespaceScopedResources: [...roles, ...roleBindings],
        clusterScopedResources: [...clusterRoles, ...clusterRoleBindings],
        reapInterval: 30,
      },
    }
    Bugsnag.leaveBreadcrumb('Attempting to create a rbac profile', body)
    const profile = await qbert.createRbacProfile(body)
    trackEvent('Create Rbac Profile', body)
    return profile
  },
  updateFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to update rbac profile')
  },
  deleteFn: async ({ name }, currentItems) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete rbac profile', { name })
    trackEvent('Delete RBAC Profile', {
      name,
    })
    return qbert.deleteRbacProfile(name)
  },
  uniqueIdentifier,
  entityName: 'RbacProfile',
  selector: rbacProfilesSelector,
  selectorCreator: makeRbacProfilesSelector,
})

export const rbacProfileBindingsActions = createCRUDActions(ActionDataKeys.RbacProfileBindings, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get rbac profile bindings')
    return await qbert.getRbacProfileBindings()
  },
  createFn: async ({ cluster, profileName }) => {
    const clusterId = cluster[0].uuid
    const body = {
      apiVersion: 'sunpike.platform9.com/v1alpha2',
      kind: 'ClusterProfileBinding',
      metadata: {
        name: `${profileName}-${clusterId}-${uuid.v4()}`,
      },
      spec: {
        clusterRef: clusterId,
        profileRef: `default/${profileName}`,
        dryRun: false,
      },
    }
    Bugsnag.leaveBreadcrumb('Attempting to create rbac profile binding', { clusterId, profileName })
    trackEvent('Create RBAC Profile Binding', {
      clusterId,
      profileName,
    })
    const profileBinding = await qbert.createRbacProfileBinding(body)
    return profileBinding
  },
  updateFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to update rbac profile binding')
  },
  deleteFn: async ({ name }) => {
    Bugsnag.leaveBreadcrumb('Attempting to update rbac profile binding')
    return await qbert.deleteRbacProfileBinding(name)
  },
  uniqueIdentifier,
  entityName: 'RbacProfileBinding',
  selector: rbacProfileBindingsSelector,
  selectorCreator: makeRbacProfileBindingsSelector,
})

export const patchRbacProfile = async (name, body) => {
  const response = await qbert.patchRbacProfile(name, body)
  return response
}

export const getDriftAnalysis = async ({ cluster, profileName }) => {
  const clusterId = cluster[0].uuid
  const body = {
    apiVersion: 'sunpike.platform9.com/v1alpha2',
    kind: 'ClusterProfileBinding',
    metadata: {
      name: `${profileName}-${clusterId}-${uuid.v4()}`,
    },
    spec: {
      clusterRef: clusterId,
      profileRef: `default/${profileName}`,
      dryRun: true,
    },
  }
  Bugsnag.leaveBreadcrumb('Attempting to get drift analysis', { clusterId, profileName })
  trackEvent('Get drift analysis', {
    clusterId,
    profileName,
  })
  const driftAnalysis = await qbert.createRbacProfileBinding(body)
  return driftAnalysis
}

export const getProfileBinding = async (profileName) => {
  const details = await qbert.getRbacProfileBinding(profileName)
  return details
}

export const getProfileBindingDetails = async (profileName) => {
  const details = await qbert.getRbacProfileBindingDetails(profileName)
  return details
}

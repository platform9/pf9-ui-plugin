import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { makeRbacProfilesSelector, rbacProfilesSelector } from './selectors'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'metadata.uid'
console.log('==============this got loaded up=============')
export const rbacProfilesActions = createCRUDActions(ActionDataKeys.RbacProfiles, {
  listFn: async ({ namespace }) => {
    console.log('rbac profiles list function')
    Bugsnag.leaveBreadcrumb('Attempting to get rbac profiles')
    console.log(namespace, 'pass this into rbac profiles get after done testing')
    const response = await qbert.getRbacProfiles('default')
    // Surface namespace like we do clusterId for indexing purposes
    // When we switch tenants, we will need to update the list of profiles
    // to match the new one. Not sure if it will automatically pull
    // the profiles for the new namespace, but test it once I can
    const mappedResponse = response.map((profile) => {
      return {
        ...profile,
        namespace: profile.metadata.namespace,
      }
    })
    return mappedResponse
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create rbac profile')
  },
  updateFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to update rbac profile')
  },
  deleteFn: async ({ id }, currentItems) => {
    Bugsnag.leaveBreadcrumb('Attempting to update rbac profile')
  },
  uniqueIdentifier,
  entityName: 'RbacProfile',
  selector: rbacProfilesSelector,
  selectorCreator: makeRbacProfilesSelector,
  // indexBy: 'namespace',
})

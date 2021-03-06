import { flatten } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import createContextLoader from 'core/helpers/createContextLoader'
import { someAsync } from 'utils/async'
import DataKeys from 'k8s/DataKeys'
import store from 'app/store'
import { cacheActions } from 'core/caching/cacheReducers'
import { appActions } from '../actions'
import { makeDeployedAppsSelector } from './selectors'
import namespaceActions from 'k8s/components/namespaces/actions'
import { trackEvent } from 'utils/tracking'
import Bugsnag from '@bugsnag/js'

const { helm } = ApiClient.getInstance()
const { dispatch } = store

export const deployedAppActions = createCRUDActions(DataKeys.DeployedApps, {
  listFn: async ({ clusterId, namespace }) => {
    Bugsnag.leaveBreadcrumb('Attempting to list deployed apps', { clusterId, namespace })
    // Fetch dependent cache
    await appActions.list()

    if (namespace === allKey) {
      const namespaces = await namespaceActions.list({ clusterId })
      const releases = someAsync(
        namespaces.map(async (namespace) => await helm.getReleases(clusterId, namespace.name)),
      ).then(flatten)
      return releases
    } else {
      const release = await helm.getReleases(clusterId, namespace)
      return release
    }
  },
  updateFn: async ({
    clusterId,
    namespace,
    deploymentName,
    repository,
    chart,
    action,
    version = undefined,
    values = undefined,
  }) => {
    const body = {
      Name: deploymentName,
      Chart: `${repository}/${chart}`,
      Action: action,
      Version: version,
      Vals: values,
    }
    Bugsnag.leaveBreadcrumb('Attempting to update deployed application', {
      clusterId: clusterId,
      ...body,
    })
    const result = helm.updateRelease(clusterId, namespace, body)
    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.DeployedAppDetails }))

    trackEvent('Update Application ', {
      cluster: clusterId,
      appName: deploymentName,
    })

    return result
  },
  deleteFn: async ({ clusterId, namespace, name }) => {
    const data = {
      Name: name,
    }
    Bugsnag.leaveBreadcrumb('Attempting to delete deployed application', {
      clusterId,
      namespace,
      name,
    })
    await helm.deleteRelease(clusterId, namespace, data)

    trackEvent('Delete Application', {
      cluster: clusterId,
      appName: name,
    })
  },
  customOperations: {
    deploy: async (
      {
        clusterId,
        namespace,
        deploymentName,
        repository,
        chartName,
        version,
        dry = false,
        values = undefined,
      },
      prevItems,
    ) => {
      const body = {
        Name: deploymentName,
        Chart: `${repository}/${chartName}`,
        Dry: dry,
        Version: version,
        Vals: values,
      }
      Bugsnag.leaveBreadcrumb('Attempting to deploy application', { clusterId, namespace, ...body })
      await helm.deployChart(clusterId, namespace, body)

      // Refetch the list of deployed apps under this clusterId and namespace
      deployedAppActions.list({ clusterId, namespace }, true)

      trackEvent('Deploy Application', {
        cluster: clusterId,
        appName: deploymentName,
      })

      return prevItems
    },
  },
  uniqueIdentifier: ['name', 'clusterId', 'namespace'],
  indexBy: ['clusterId', 'namespace'],
  selectorCreator: makeDeployedAppsSelector,
})

export const deploymentDetailLoader = createContextLoader(
  DataKeys.DeployedAppDetails,
  async ({ clusterId, namespace, releaseName }) => {
    Bugsnag.leaveBreadcrumb('Attempting to get app deployment details', {
      clusterId,
      namespace,
      releaseName,
    })
    const details = helm.getReleaseInfo(clusterId, namespace, releaseName)
    return details
  },
  {
    uniqueIdentifier: 'Name',
    indexBy: ['clusterId', 'namespace', 'releaseName'],
  },
)

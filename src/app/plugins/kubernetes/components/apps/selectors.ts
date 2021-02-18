import { createSelector } from 'reselect'
import { map, mergeLeft, pipe, filter, pathEq, identity } from 'ramda'
import { pathStr, filterIf, pathStrOr } from 'utils/fp'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'
import { allKey, imageUrlRoot } from 'app/constants'
import moment from 'moment'
const apiDateFormat = 'ddd MMM D HH:mm:ss YYYY'

export const releasesOnClusterSelector = createSelector(
  getDataSelector<DataKeys.Releases>(DataKeys.Releases, ['clusterId']),
  getDataSelector<DataKeys.Clusters>(DataKeys.Clusters, ['uuid']),
  (releases, clusters) => {
    console.log('releases', releases)
    console.log('clusters', clusters)
    return map((release: any) => {
      const cluster: any = clusters.find((cluster) => release.clusterId === cluster.uuid) || {}
      return {
        ...release,
        clusterId: {
          uuid: cluster.uuid,
          kubeRoleVersion: cluster.kubeRoleVersion,
          numWorkers: cluster.numWorkers,
        },
      }
    })
  },
)

export const deploymentDetailsSelector = createSelector(
  getDataSelector<DataKeys.ReleaseDetail>(DataKeys.ReleaseDetail, ['clusterId', 'release']),
  (items) => {
    return map((item: any) => ({
      ...item,
      name: pathStr('attributes.name', item),
      chartName: pathStr('attributes.chartName', item),
      version: pathStr('attributes.chartVersion', item),
      namespace: pathStr('attributes.namespace', item),
      status: pathStr('attributes.status', item),
      lastUpdated: moment(pathStr('attributes.updated', item), apiDateFormat).format('llll'),
      logoUrl: pathStrOr(`${imageUrlRoot}/default-app-logo.png`, 'attributes.chartIcon', item),
      resourcesText: pathStr('attributes.resources', item),
      notesText: pathStr('attributes.notes', item),
    }))(items)
  },
)

export const makeDeploymentDetailsSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [deploymentDetailsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (items, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(items)
    },
  )
}

export const makeAppsSelector = (
  defaultParams = {
    orderBy: 'name',
    orderDirection: 'asc',
  },
) => {
  return createSelector(
    [
      getDataSelector<DataKeys.Apps>(DataKeys.Apps, ['clusterId']),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (items, params) => {
      const { repositoryId, orderBy, orderDirection } = params
      const filterByRepo =
        repositoryId && repositoryId !== allKey
          ? filter(pathEq(['attributes', 'repo', 'name'], repositoryId))
          : identity

      const normalize = map((item: any) => {
        return {
          ...item,
          name: pathStr('attributes.name', item),
          description: pathStr('attributes.description', item),
          created: moment(pathStr('relationships.latestChartVersion.data.created', item)),
        }
      })
      return pipe(filterByRepo, normalize, createSorter({ orderBy, orderDirection }))(items)
    },
  )
}

export const makeReleasesSelector = (
  defaultParams = {
    orderBy: 'name',
    orderDirection: 'asc',
  },
) => {
  return createSelector(
    [
      getDataSelector<DataKeys.Releases>(DataKeys.Releases, ['clusterId']),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (items, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe<any, any, any, any>(
        filterIf(namespace && namespace !== allKey, pathEq(['attributes', 'namespace'], namespace)),
        map((item: any) => ({
          ...item,
          name: pathStr('attributes.name', item),
          logoUrl: pathStrOr(`${imageUrlRoot}/default-app-logo.png`, 'attributes.chartIcon', item),
          lastUpdated: moment(pathStr('attributes.updated', item), apiDateFormat).format('llll'),
        })),
        createSorter({ orderBy, orderDirection }),
      )(items)
    },
  )
}

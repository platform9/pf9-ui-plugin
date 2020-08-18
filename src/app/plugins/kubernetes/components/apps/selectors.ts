import { createSelector } from 'reselect'
import { map, mergeLeft, pipe, filter, pathEq, identity, find, propOr, propEq } from 'ramda'
import { emptyArr, pathStr, filterIf } from 'utils/fp'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'
import { imageUrlRoot, allKey } from 'app/constants'
import moment from 'moment'

const uniqueIdentifier = 'id'
const apiDateFormat = 'ddd MMM D HH:mm:ss YYYY'

export const appDetailsSelector = createSelector(
  getDataSelector(DataKeys.AppDetail, ['clusterId', 'id', 'release', 'version']),
  (items) => {
    return map(({ id, ...item }) => {
      const chartId = id.substring(0, id.indexOf(':')) // Remove the version from the ID
      return {
        ...item,
        id: chartId,
        name: chartId.substring(`${chartId.indexOf('/')} 1`),
        home: pathStr('relationships.chart.data.home', item),
        sources: pathStr('relationships.chart.data.sources', item),
        maintainers: pathStr('relationships.chart.data.maintainers', item),
      }
    })(items)
  },
)

export const makeAppDetailsSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [appDetailsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (items, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(items)
    },
  )
}

export const deploymentDetailsSelector = createSelector(
  getDataSelector(DataKeys.ReleaseDetail, ['clusterId', 'release']),
  (items) => {
    return map((item) => ({
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

export const appVersionSelector = createSelector(
  getDataSelector(DataKeys.AppVersions, ['clusterId', 'appId', 'release']),
  (items) => {
    return map((item) => ({
      ...item,
      version: pathStr('attributes.version', item),
      appVersion: pathStr('attributes.app_version', item),
      versionLabel: [
        pathStr('attributes.version', item),
        moment(pathStr('attributes.created', item)).format('MMM DD, YYYY'),
      ].join(' - '),
      downloadLink: pathStr('attributes.urls.0', item),
    }))(items)
  },
)

export const makeAppVersionSelector = (
  defaultParams = {
    orderBy: 'version',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [appVersionSelector, (_, params) => mergeLeft(params, defaultParams)],
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
      getDataSelector(DataKeys.Apps, ['clusterId']),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (items, params) => {
      const { repositoryId, orderBy, orderDirection } = params
      const filterByRepo =
        repositoryId && repositoryId !== allKey
          ? filter(pathEq(['attributes', 'repo', 'name'], repositoryId))
          : identity

      const normalize = map((item) => {
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
      getDataSelector(DataKeys.Releases, ['clusterId']),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (items, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe(
        filterIf(namespace && namespace !== allKey, pathEq(['attributes', 'namespace'], namespace)),
        map((item) => ({
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

export const repositoriesSelector = createSelector(
  [getDataSelector(DataKeys.Repositories), getDataSelector(DataKeys.RepositoriesWithClusters)],
  (rawRepos, reposWithClusters) => {
    return map(({ id, type, attributes }) => ({
      id,
      type,
      name: attributes.name,
      url: attributes.URL,
      source: attributes.source,
      clusters: pipe(
        find(propEq(uniqueIdentifier, id)),
        propOr(emptyArr, 'clusters'),
      )(reposWithClusters),
    }))(rawRepos)
  },
)

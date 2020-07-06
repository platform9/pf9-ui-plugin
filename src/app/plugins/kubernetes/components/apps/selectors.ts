import { createSelector } from 'reselect'
import { pathStr, map, mergeLeft, pipe } from 'ramda'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'

export const appDetailsSelector = createSelector(
  getDataSelector(DataKeys.AppDetail, ['clusterId', 'id', 'release', 'version']),
  (items) => {
    return map(({ id, ...item }) => {
      const chartId = id.substring(0, id.indexOf(':')) // Remove the version from the ID
      return {
        ...item,
        id: chartId,
        name: chartId.substring(chartId.indexOf('/') + 1),
        home: pathStr('relationships.chart.data.home', item),
        sources: pathStr('relationships.chart.data.sources', item),
        maintainers: pathStr('relationships.chart.data.maintainers', item),
      }
    })(items)
  },
)

export const makeParamsAppDetailsSelector = (
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

export const makeParamsDeploymentDetailsSelector = (
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

export const makeParamsAppVersionSelector = (
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

export const appSelector = createSelector(
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

export const makeParamsAppVersionSelector = (
  defaultParams = {
    orderBy: 'name',
    orderDirection: 'asc',
  },
) => {
  return createSelector(
    [appSelector, (_, params) => mergeLeft(params, defaultParams)],
    (items, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(items)
    },
  )
}

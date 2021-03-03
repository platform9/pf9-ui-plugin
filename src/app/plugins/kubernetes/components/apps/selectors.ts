import { createSelector } from 'reselect'
import { map, mergeLeft, pipe, filter, pathEq, identity } from 'ramda'
import { pathStr, pathStrOr } from 'utils/fp'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'
import { allKey, imageUrlRoot } from 'app/constants'
import moment from 'moment'
const apiDateFormat = 'ddd MMM D HH:mm:ss YYYY'

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
      getDataSelector<DataKeys.Apps>(DataKeys.Apps),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (releases, charts, params) => {
      const { orderBy, orderDirection } = params
      return pipe<any, any, any>(
        map((release: any) => {
          const chart = charts.find((chart) => chart.name === release.chart)
          return {
            ...release,
            repository: chart?.repository,
            icon: chart?.icon,
            home: chart?.home,
          }
        }),
        createSorter({ orderBy, orderDirection }),
      )(releases)
    },
  )
}

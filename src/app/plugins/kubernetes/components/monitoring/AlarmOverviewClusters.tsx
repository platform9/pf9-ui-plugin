import React, { useMemo, useState } from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import SearchBar from 'core/components/SearchBar'
import { IClusterSelector } from '../infrastructure/clusters/model'
import { IUseDataLoader } from '../infrastructure/nodes/model'
import AlphabeticalPicklist from './AlphabeticalPicklist'
import Text from 'core/elements/text'
import Progress from 'core/components/progress/Progress'
import { LoadingGifs } from 'app/constants'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from '../infrastructure/clusters/actions'
import { routes } from 'core/utils/routes'
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { importedClusterActions } from '../infrastructure/importedClusters/actions'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  clusterFilters: {
    display: 'flex',
    alignItems: 'center',
  },
  // To get the search bar & input select to be equal height I found this
  // workaround to be the easiest to do it
  clusterSearch: {
    flexGrow: 1,
    marginTop: `${theme.spacing(1)}px !important`,
    marginRight: `${theme.spacing(1)}px !important`,
    '& .MuiInputBase-root': {
      paddingTop: 5,
      paddingBottom: 5,
    },
  },
  clustersListContainer: {
    minHeight: 200,
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5, 3),
    boxShadow: '0 2.5px 2.5px -1.5px rgba(0, 0, 0, 0.2), 0 1.5px 7px 1px rgba(0, 0, 0, 0.12)',
  },
  clustersList: {
    display: 'grid',
    rowGap: theme.spacing(1),
  },
  clusterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clusterLinks: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    columnGap: theme.spacing(3),
  },
  noClustersText: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
}))

const defaultParams = {
  search: '',
  orderDirection: 'asc',
}

const AlarmOverviewClusters = () => {
  const classes = useStyles({})
  const [params, updateParams] = useState(defaultParams)

  // I think I also need to grab the imported clusters here too
  const [clusters, clustersLoading]: IUseDataLoader<IClusterSelector> = useDataLoader(
    clusterActions.list,
    {
      prometheusClusters: true,
      orderBy: 'name',
      orderDirection: params.orderDirection,
    },
  ) as any
  const [importedClusters, importedClustersLoading] = useDataLoader(importedClusterActions.list, {
    prometheusClusters: true,
    orderBy: 'name',
    orderDirection: params.orderDirection,
  })

  const filteredClusters = useMemo(() => {
    const allClusters = [...clusters, ...importedClusters]
    return allClusters.filter((cluster) => {
      return cluster.name.includes(params.search)
    })
  }, [clusters, importedClusters, params.search])

  return (
    <Progress
      loading={clustersLoading || importedClustersLoading}
      overlay
      renderContentOnMount
      loadingImage={LoadingGifs.BluePinkTiles}
    >
      <div className={classes.clusterFilters}>
        <SearchBar
          searchTerm={params.search}
          onSearchChange={(value) => updateParams({ ...params, search: value })}
          className={classes.clusterSearch}
        />
        <AlphabeticalPicklist
          value={params.orderDirection}
          onChange={(value) => updateParams({ ...params, orderDirection: value })}
        />
      </div>
      <div className={classes.clustersListContainer}>
        {!filteredClusters.length && (
          <Text className={classes.noClustersText} variant="body2">
            No clusters with monitoring found
          </Text>
        )}
        {filteredClusters.map((cluster) => (
          <div className={classes.clustersList}>
            <div key={cluster.uuid} className={classes.clusterRow}>
              <Text variant="body2">{cluster.name}</Text>
              <div className={classes.clusterLinks}>
                <ExternalLink url={cluster.usage.grafanaLink}>
                  <FontAwesomeIcon size="sm">chart-line</FontAwesomeIcon>
                </ExternalLink>
                <SimpleLink src={routes.cluster.nodes.path({ id: cluster.uuid })}>
                  <FontAwesomeIcon size="sm">search-plus</FontAwesomeIcon>
                </SimpleLink>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Progress>
  )
}

export default AlarmOverviewClusters

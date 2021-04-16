import React, { useMemo, useState } from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { IUseDataLoader } from '../infrastructure/nodes/model'
import { IAlertSelector } from '../alarms/model'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadAlerts } from '../alarms/actions'
import { allKey, LoadingGifs } from 'app/constants'
import { getAllClusters } from '../infrastructure/clusters/actions'
import Text from 'core/elements/text'
import AlarmOverviewOrderPicklist from './AlarmOverviewOrderPicklist'
import SeverityPicklist from '../alarms/SeverityPicklist'
import Progress from 'core/components/progress/Progress'
import ClusterAlarmCard from './ClusterAlarmCard'
import AlarmOverviewClusters from './AlarmOverviewClusters'
import RefreshButton from 'core/components/buttons/refresh-button'
import NoContentMessage from 'core/components/NoContentMessage'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  alarmsContainer: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
  },
  overviewContainer: {
    display: 'flex',
  },
  clustersContainer: {
    minWidth: 380,
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(2.5),
  },
  alarmFilters: {
    display: 'inline-grid',
    gridTemplateColumns: 'auto auto auto',
    columnGap: theme.spacing(2.5),
    alignItems: 'center',
  },
  refreshButton: {
    marginLeft: 0,
  },
}))

const defaultParams = {
  severity: allKey,
  clusterId: allKey,
  order: 'highToLow',
}

// Todo: Pagination or a max height container with scroll
const AlarmOverviewPage = () => {
  const classes = useStyles({})
  const [params, updateParams] = useState(defaultParams)
  const [alarms, alarmsLoading, reloadAlarms]: IUseDataLoader<IAlertSelector> = useDataLoader(
    loadAlerts,
    params,
  ) as any

  const [allClusters, allClustersLoading, reloadAllClusters] = useDataLoader(getAllClusters, {
    prometheusClusters: true,
    orderBy: 'name',
  })

  const clustersWithAlarms = useMemo(() => {
    if (!alarmsLoading && !allClustersLoading) {
      const result = allClusters.map((cluster) => {
        const clusterAlarms = alarms.filter((alarm) => {
          return (
            alarm.clusterId === cluster.uuid &&
            ['fatal', 'critical', 'warning'].includes(alarm.severity)
          )
        })
        return {
          ...cluster,
          numAlarms: clusterAlarms.length,
          fatalAlarms: clusterAlarms.filter((alarm) => alarm.severity === 'fatal'),
          criticalAlarms: clusterAlarms.filter((alarm) => alarm.severity === 'critical'),
          warningAlarms: clusterAlarms.filter((alarm) => alarm.severity === 'warning'),
        }
      })
      return result
    }
    return []
  }, [alarms, allClusters, alarmsLoading, allClustersLoading])

  const filterBySeverity = (alarms, params) => {
    return alarms.filter((alarm) => {
      if (params.severity === allKey) {
        return true
      } else if (params.severity === 'fatal') {
        return alarm.fatalAlarms.length
      } else if (params.severity === 'critical') {
        return alarm.criticalAlarms.length
      } else if (params.severity === 'warning') {
        return alarm.warningAlarms.length
      }
      return true
    })
  }

  const sortAlarms = (alarms, params) => {
    if (params.order === 'highToLow') {
      return alarms.sort((a, b) => b.numAlarms - a.numAlarms)
    } else if (params.order === 'lowToHigh') {
      return alarms.sort((a, b) => a.numAlarms - b.numAlarms)
    }
    return alarms
  }

  const filteredClustersWithAlarms = useMemo(() => {
    if (clustersWithAlarms) {
      // Make these a pipe of filter functions if possible?
      return sortAlarms(filterBySeverity(clustersWithAlarms, params), params)
    }
    return []
  }, [clustersWithAlarms, params.order, params.severity])

  return (
    <Progress
      loading={alarmsLoading || allClustersLoading}
      overlay
      renderContentOnMount
      loadingImage={LoadingGifs.BluePinkTiles}
    >
      <div>
        <div className={classes.overviewContainer}>
          <div className={classes.alarmsContainer}>
            <div className={classes.alarmFilters}>
              <SeverityPicklist
                selectFirst={false}
                onChange={(value) => updateParams({ ...params, severity: value })}
                value={params.severity}
              />
              <AlarmOverviewOrderPicklist
                onChange={(value) => updateParams({ ...params, order: value })}
                value={params.order}
              />
              <RefreshButton
                className={classes.refreshButton}
                onRefresh={() => {
                  reloadAlarms(true)
                  reloadAllClusters(true)
                }}
              />
            </div>
            {!filteredClustersWithAlarms.length && <NoContentMessage message="No data found" />}
            {filteredClustersWithAlarms.map((cluster) => (
              <ClusterAlarmCard key={cluster.uuid} cluster={cluster} />
            ))}
          </div>
          <div className={classes.clustersContainer}>
            <Text variant="subtitle1">Healthy Clusters</Text>
            <AlarmOverviewClusters />
          </div>
        </div>
      </div>
    </Progress>
  )
}

export default AlarmOverviewPage

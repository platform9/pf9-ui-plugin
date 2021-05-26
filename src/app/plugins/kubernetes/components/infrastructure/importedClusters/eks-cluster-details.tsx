import React from 'react'

import { makeStyles } from '@material-ui/styles'

import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import SimpleLink from 'core/components/SimpleLink'

import { routes } from 'core/utils/routes'

import ClusterNodeGroups from './node-groups'
import ClusterNodes from './nodes'
import ClusterDetails from './details'
import HeaderCard from './header-card'

import Theme from 'core/themes/model'
import ClusterDeployedApps from '../clusters/cluster-deployed-apps'
import ClusterAlarms from '../clusters/cluster-alarms'

const EKSClusterDetails = ({ cluster, reload, loading }) => {
  const classes = useStyles()

  const clusterHeader = <HeaderCard title={cluster?.name} cluster={cluster} />
  return (
    <>
      {/* <PollingData hidden loading={loading} onReload={reload} refreshDuration={oneSecond * 30} /> */}
      <SimpleLink src={routes.cluster.imported.list.path()} className={classes.backLink}>
        « Back to Cluster List
      </SimpleLink>
      <Tabs>
        <Tab value="node-groups" label="Node Groups">
          {clusterHeader}
          <ClusterNodeGroups cluster={cluster} reload={reload} loading={loading} />
        </Tab>
        <Tab value="nodes" label="Nodes">
          {clusterHeader}
          <ClusterNodes cluster={cluster} reload={reload} loading={loading} />
        </Tab>
        <Tab value="details" label="Details">
          {clusterHeader}
          <ClusterDetails cluster={cluster} reload={reload} loading={loading} />
        </Tab>
        <Tab value="deployedApps" label="Deployed Apps">
          {clusterHeader}
          <div className={classes.deployedAppsContainer}>
            <ClusterDeployedApps cluster={cluster} reload={reload} loading={loading} />
          </div>
        </Tab>
        {cluster.hasPrometheus && (
          <Tab value="alarms" label="Alarms">
            <div className={classes.tabContainer}>
              <ClusterAlarms cluster={cluster} headerCard={clusterHeader} />
            </div>
          </Tab>
        )}
      </Tabs>
    </>
  )
}

export default EKSClusterDetails

const useStyles = makeStyles<Theme>((theme) => ({
  backLink: {
    position: 'absolute',
    right: 0,
    top: 8,
    zIndex: 100,
    ...theme.typography.caption2,
  },
  deployedAppsContainer: {
    paddingTop: theme.spacing(2),
    maxWidth: 1234, // same maxWidth as tabContainer in ClusterDetails page
  },
}))

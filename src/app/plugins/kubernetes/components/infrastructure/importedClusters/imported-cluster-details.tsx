import React, { useEffect } from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { importedClusterActions } from './actions'
import PageContainer from 'core/components/pageContainer/PageContainer'
import { routes } from 'core/utils/routes'
import { IUseDataLoader } from '../nodes/model'
import { ImportedClusterSelector } from './model'
import { makeStyles } from '@material-ui/styles'

import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import SimpleLink from 'core/components/SimpleLink'

import EksClusterNodeGroups from './node-groups'
import GkeClusterNodeGroups from './gke-node-groups'
import AgentPools from './agent-pools'
import AksClusterNodes from './aks-nodes'
import EksClusterNodes from './nodes'
import GkeClusterNodes from './gke-nodes'
import AksClusterDetails from './aks-details'
import EksClusterDetails from './details'
import GkeClusterDetails from './gke-details'
import HeaderCard from './header-card'

import Theme from 'core/themes/model'
import ClusterDeployedApps from '../clusters/cluster-deployed-apps'
import ClusterAlarms from '../clusters/cluster-alarms'
import { ClusterCloudPlatforms } from 'app/constants'

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

const clusterNodeGroupsComponents = {
  [ClusterCloudPlatforms.AKS]: AgentPools,
  [ClusterCloudPlatforms.EKS]: EksClusterNodeGroups,
  [ClusterCloudPlatforms.GKE]: GkeClusterNodeGroups,
}

const clusterNodesComponents = {
  [ClusterCloudPlatforms.AKS]: AksClusterNodes,
  [ClusterCloudPlatforms.EKS]: EksClusterNodes,
  [ClusterCloudPlatforms.GKE]: GkeClusterNodes,
}

const clusterDetailsComponents = {
  [ClusterCloudPlatforms.AKS]: AksClusterDetails,
  [ClusterCloudPlatforms.EKS]: EksClusterDetails,
  [ClusterCloudPlatforms.GKE]: GkeClusterDetails,
}

function ImportedClusterDetails() {
  const classes = useStyles()
  const { match, history } = useReactRouter()
  const [clusters, loading, reload]: IUseDataLoader<ImportedClusterSelector> = useDataLoader(
    importedClusterActions.list,
  ) as any
  const cluster = clusters.find((x) => x.uuid === match.params.id)

  useEffect(() => {
    if (!cluster) {
      history.push(routes.cluster.imported.list.path())
    }
  }, [cluster, history])

  if (!cluster) {
    return null
  }

  const clusterHeader = <HeaderCard title={cluster?.name} cluster={cluster} />

  const ClusterNodeGroups = clusterNodeGroupsComponents[cluster.providerType]
  const ClusterNodes = clusterNodesComponents[cluster.providerType]
  const ClusterDetails = clusterDetailsComponents[cluster.providerType]

  return (
    <PageContainer>
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
    </PageContainer>
  )
}

export default ImportedClusterDetails

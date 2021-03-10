// Libs
import React, { FC } from 'react'
import { Collapse } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
// Components
import { ClusterListHeader } from './clusters/ClustersListPageHeader'
import { NodeListHeader } from './nodes/NodesListPageHeader'
import { CloudProviderListHeader } from './cloudProviders/CloudProviderListHeader'
import { ImportedClusterListHeader } from './importedClusters/ImportedClustersListPageHeader'
// Types
import Theme from 'core/themes/model'
// import calcUsageTotalByPath from 'k8s/util/calcUsageTotals'
// import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'

interface Props {
  tab: InfrastructureTabs
  visible: boolean
}

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    alignSelf: 'normal',
  },
  card: {
    marginRight: theme.spacing(),
  },
}))

export enum InfrastructureTabs {
  Clusters = 'clusters',
  ImportedClusters = 'importedClusters',
  Nodes = 'nodes',
  CloudProviders = 'cloudProviders',
}

const headerCardMap = new Map<InfrastructureTabs, { component: React.ComponentType }>([
  [InfrastructureTabs.Clusters, { component: ClusterListHeader }],
<<<<<<< HEAD
  [InfrastructureTabs.ImportedClusters, { component: ClusterListHeader }],
=======
  [InfrastructureTabs.ImportedClusters, { component: ImportedClusterListHeader }],
>>>>>>> 350098dd19d293f22076daa557a06b0c55449fce
  [InfrastructureTabs.Nodes, { component: NodeListHeader }],
  [InfrastructureTabs.CloudProviders, { component: CloudProviderListHeader }],
])

const InfrastructureStats: FC<Props> = ({ tab, visible }) => {
  const classes = useStyles({})
  const { component: InfrastructureComponent } = headerCardMap.get(tab)

  return (
    <Collapse className={classes.root} in={visible}>
      <InfrastructureComponent />
    </Collapse>
  )
}

export default InfrastructureStats

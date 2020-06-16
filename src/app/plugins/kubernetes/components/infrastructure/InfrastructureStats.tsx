// Libs
import React, { FC } from 'react'
import { Collapse } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
// Components
import { ClusterListHeader } from './clusters/ClustersListPageHeader'
import { NodeListHeader } from './nodes/NodesListPageHeader'
import { CloudProviderListHeader } from './cloudProviders/CloudProviderListHeader'
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
    margin: theme.spacing(1, 0),
  },
  card: {
    marginRight: theme.spacing(),
  },
}))

export enum InfrastructureTabs {
  Clusters = 'clusters',
  Nodes = 'nodes',
  CloudProviders = 'cloudProviders',
}

const headerCardMap = new Map<InfrastructureTabs, { component: React.ComponentType }>([
  [InfrastructureTabs.Clusters, { component: ClusterListHeader }],
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

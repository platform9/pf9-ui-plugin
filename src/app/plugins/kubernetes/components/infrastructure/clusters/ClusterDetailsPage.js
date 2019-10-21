import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import ClusterInfo from './ClusterInfo'
import ClusterNodes from './ClusterNodes'
import PageContainer from 'core/components/pageContainer/PageContainer'
import SimpleLink from 'core/components/SimpleLink'
import { makeStyles } from '@material-ui/styles'
import { Typography } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'

const useStyles = makeStyles(theme => ({
  backLink: {
    marginBottom: theme.spacing(2),
  },
}))

const ClusterDetailsPage = () => {
  const { match } = useReactRouter()
  const classes = useStyles()
  const [clusters] = useDataLoader(clusterActions.list)
  const { name } = clusters.find(x => x.uuid === match.params.id) || {}
  return <PageContainer header={<>
    <Typography variant="h3">Cluster {name}</Typography>
    <SimpleLink src={`/ui/kubernetes/infrastructure#clusters`} className={classes.backLink}>
      « Back to Cluster List
    </SimpleLink></>}>
    <Tabs>
      <Tab value="info" label="Info"><ClusterInfo /></Tab>
      <Tab value="nodes" label="Nodes"><ClusterNodes /></Tab>
    </Tabs>
  </PageContainer>
}

export default ClusterDetailsPage

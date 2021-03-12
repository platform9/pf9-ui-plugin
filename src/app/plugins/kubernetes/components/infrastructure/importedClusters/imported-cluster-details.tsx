import React from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { importedClusterActions } from './actions'

import { makeStyles } from '@material-ui/styles'

import PageContainer from 'core/components/pageContainer/PageContainer'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import SimpleLink from 'core/components/SimpleLink'

import { routes } from 'core/utils/routes'

import ClusterNodeGroups from './node-groups'
import ClusterNodes from './nodes'
import ClusterDetails from './details'
import HeaderCard from './header-card'

import Theme from 'core/themes/model'
import { IUseDataLoader } from '../nodes/model'
import { ImportedClusterSelector } from './model'

function ImportedClusterDetails() {
  const { match } = useReactRouter()
  const classes = useStyles()
  const [clusters, loading, reload]: IUseDataLoader<ImportedClusterSelector> = useDataLoader(
    importedClusterActions.list,
  ) as any
  const cluster = clusters.find((x) => x.uuid === match.params.id)
  const clusterHeader = <HeaderCard title={cluster?.name} cluster={cluster} />
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
      </Tabs>
    </PageContainer>
  )
}

export default ImportedClusterDetails

const useStyles = makeStyles<Theme>((theme) => ({
  backLink: {
    position: 'absolute',
    right: 0,
    top: 8,
    zIndex: 100,
    ...theme.typography.caption2,
  },
}))

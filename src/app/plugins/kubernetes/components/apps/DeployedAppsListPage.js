import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import SimpleLink from 'core/components/SimpleLink'
import { CardMedia } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { releaseActions } from 'k8s/components/apps/actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'

const styles = theme => ({
  icon: {
    width: '100%',
    minWidth: 100,
    minHeight: 100,
    backgroundSize: 'contain',
    backgroundPosition: `50% ${theme.spacing(1)}px`,
  },
})

const IconCell = withStyles(styles)(({ classes, ...rest }) =>
  <CardMedia className={classes.icon} {...rest} />)

const renderDeployedAppIcon = (chartIcon, deployedApp) =>
  <SimpleLink src={`/ui/kubernetes/deployed/${deployedApp.id}`}>
    <IconCell image={chartIcon} title="icon" />
  </SimpleLink>

const renderDeployedAppLink = (name, deployedApp) =>
  <SimpleLink src={`/ui/kubernetes/deployed/${deployedApp.id}`}>{name}</SimpleLink>

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('DeployedApps', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(releaseActions.list, params)
    return <ListContainer
      loading={loading}
      reload={reload}
      data={data}
      getParamsUpdater={getParamsUpdater}
      filters={<>
        <ClusterPicklist
          showAll={false}
          onChange={getParamsUpdater('clusterId')}
          value={params.clusterId}
          onlyAppCatalogEnabled
        />
        <NamespacePicklist
          onChange={getParamsUpdater('namespace')}
          value={params.namespace}
          clusterId={params.clusterId}
          disabled={!params.clusterId}
        />
      </>}
      {...pick(listTablePrefs, params)}
    />
  }
}

export const options = {
  columns: [
    { id: 'attributes.chartIcon', label: '', render: renderDeployedAppIcon },
    { id: 'attributes.chartName', label: 'Name', render: renderDeployedAppLink },
    { id: 'type', label: 'App Type' },
    { id: 'attributes.chartVersion', label: 'Version' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'attributes.status', label: 'Status' },
    { id: 'attributes.updated', label: 'Last updated' },
  ],
  // editUrl: '/ui/kubernetes/infrastructure/releases/edit',
  name: 'DeployedApps',
  title: 'Deployed Apps',
  uniqueIdentifier: 'id',
  ListPage,
}

const { ListPage: DeployedAppsListPage } = createCRUDComponents(options)

export default DeployedAppsListPage

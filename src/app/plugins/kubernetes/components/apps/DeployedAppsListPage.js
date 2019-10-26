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
    backgroundPosition: 'center',
  },
})

const IconCell = withStyles(styles)(({ classes, ...rest }) =>
  <CardMedia className={classes.icon} {...rest} />)

const renderDeployedAppIcon = (chartIcon, { clusterId, id }) =>
  <SimpleLink src={`/ui/kubernetes/apps/deployed/${clusterId}/${id}`}>
    <IconCell image={chartIcon} title="icon" />
  </SimpleLink>

const renderDeployedAppLink = (name, { clusterId, id }) =>
  <SimpleLink src={`/ui/kubernetes/apps/deployed/${clusterId}/${id}`}>{name}</SimpleLink>

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
          onChange={getParamsUpdater('clusterId')}
          value={params.clusterId}
          onlyAppCatalogEnabled
        />
        <NamespacePicklist
          selectFirst={false}
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
    { id: 'logoUrl', label: '', render: renderDeployedAppIcon },
    { id: 'name', label: 'Name', render: renderDeployedAppLink },
    { id: 'attributes.chartName', label: 'App Type' },
    { id: 'attributes.chartVersion', label: 'Version' },
    { id: 'attributes.namespace', label: 'Namespace' },
    { id: 'attributes.status', label: 'Status' },
    { id: 'lastUpdated', label: 'Last updated' },
  ],
  deleteFn: releaseActions.delete,
  // editUrl: '/ui/kubernetes/infrastructure/releases/edit',
  name: 'DeployedApps',
  title: 'Deployed Apps',
  uniqueIdentifier: 'id',
  ListPage,
}

const { ListPage: DeployedAppsListPage } = createCRUDComponents(options)

export default DeployedAppsListPage

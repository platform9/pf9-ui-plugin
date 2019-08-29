import React, { useCallback, useState } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import SimpleLink from 'core/components/SimpleLink'
import { CardMedia } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { emptyObj } from 'utils/fp'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { releaseActions } from 'k8s/components/apps/actions'

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

const ListPage = ({ ListContainer }) => {
  return () => {
    const [params, setParams] = useState(emptyObj)
    const handleClusterChange = useCallback(clusterId => setParams({ clusterId }), [])
    const [data, loading, reload] = useDataLoader(releaseActions.list, params)
    return <div>
      <ClusterPicklist
        onChange={handleClusterChange}
        value={params.clusterId}
      />
      <ListContainer loading={loading} reload={reload} data={data} />
    </div>
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

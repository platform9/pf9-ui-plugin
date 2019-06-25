import createCRUDComponents from 'core/helpers/createCRUDComponents'
import React from 'react'
import SimpleLink from 'core/components/SimpleLink'
import { loadReleases, deleteRelease } from 'k8s/components/apps/actions'
import Picklist from 'core/components/Picklist'
import { compose } from 'ramda'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { CardMedia } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { projectAs } from 'utils/fp'
import clusterizedDataLoader from 'k8s/helpers/clusterizedDataLoader'
import moize from 'moize'

const styles = theme => ({
  icon: {
    width: '100%',
    minWidth: 100,
    minHeight: 100,
    backgroundSize: 'contain',
    backgroundPosition: `50% ${theme.spacing.unit}px`,
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
  const handleClusterChange = moize(setParams => async clusterId => {
    setParams({ clusterId })
  })

  const findClusterName = (clusters, clusterId) => {
    const cluster = clusters.find(x => x.uuid === clusterId)
    return (cluster && cluster.name) || ''
  }

  return clusterizedDataLoader('releases', loadReleases)(
    ({ setParams, params: { clusterId }, data: { clusters, releases } }) =>
      <div>
        <Picklist
          name="currentCluster"
          label="Current Cluster"
          options={projectAs(
            { label: 'name', value: 'uuid' },
            clusters.filter(x => x.hasMasterNode),
          )}
          value={clusterId}
          onChange={handleClusterChange(setParams)}
        />
        <ListContainer data={releases.map(ns => ({
          ...ns,
          clusterName: findClusterName(clusters, ns.clusterId),
        }))} />
      </div>,
  )
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
  dataKey: 'releases',
  // editUrl: '/ui/kubernetes/infrastructure/releases/edit',
  deleteFn: deleteRelease,
  name: 'DeployedApps',
  title: 'Deployed Apps',
  uniqueIdentifier: 'id',
  ListPage,
}

const { ListPage: DeployedAppsListPage } = createCRUDComponents(options)

export default compose(
  requiresAuthentication,
)(DeployedAppsListPage)

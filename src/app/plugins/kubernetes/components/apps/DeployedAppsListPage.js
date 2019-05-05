import createCRUDComponents from 'core/helpers/createCRUDComponents'
import React from 'react'
import SimpleLink from 'core/components/SimpleLink'
import { loadReleases, deleteRelease } from 'k8s/components/apps/actions'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import { withAppContext } from 'core/AppContext'
import Picklist from 'core/components/Picklist'
import { compose, pathOr } from 'ramda'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { withDataLoader } from 'core/DataLoader'
import { CardMedia } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { projectAs } from 'utils/fp'

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
  class ListPage extends React.Component {
    state = {
      activeCluster: '__all__',
      pods: null,
      clusterOptions: [
        { label: 'all', value: '__all__' },
      ],
    }

    async componentDidMount () {
      const { data } = this.props
      // Make sure to use a new reference to props.data since it has now changed
      const clusters = data.clusters.filter(x => x.hasMasterNode)
      const clusterId = pathOr('__all__', [0, 'uuid'], clusters)

      await this.handleClusterChange(clusterId)
    }

    handleClusterChange = async clusterId => {
      const { context, setContext } = this.props
      this.setState({
        activeCluster: clusterId,
      }, async () => loadReleases({
        params: { clusterId },
        context,
        setContext,
      }))
    }

    findClusterName = clusterId => {
      const cluster = this.props.data.clusters.find(x => x.uuid === clusterId)
      return (cluster && cluster.name) || ''
    }

    render () {
      const { activeCluster } = this.state
      const { releases = [], clusters = [] } = this.props.data
      const filteredReleases = activeCluster === '__all__'
        ? releases
        : releases.filter(pod => pod.clusterId === activeCluster)
      const withClusterNames = filteredReleases.map(ns => ({
        ...ns,
        clusterName: this.findClusterName(ns.clusterId),
      }))
      return (
        <div>
          <Picklist
            name="currentCluster"
            label="Current Cluster"
            options={projectAs(
              { label: 'name', value: 'uuid' },
              clusters.filter(x => x.hasMasterNode),
            )}
            value={activeCluster}
            onChange={this.handleClusterChange}
          />

          <ListContainer data={withClusterNames} />
        </div>
      )
    }
  }

  return withAppContext(ListPage)
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
  withDataLoader({ clusters: loadClusters, releases: loadReleases }),
)(DeployedAppsListPage)

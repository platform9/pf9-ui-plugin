import { loadApps } from 'k8s/components/apps/actions'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { compose } from 'ramda'
import React from 'react'
import { projectAs } from 'utils/fp'
import CardTable from 'core/components/cardTable/CardTable'
import ApplicationCard from 'core/components/appCatalog/AppCard'
import moment from 'moment'
import { withDataLoader } from 'core/DataLoader'

class AppCatalogPage extends React.Component {
  state = { clusterId: '__all__' }

  sortingConfig = [
    {
      field: 'attributes.name',
      label: 'Name',
    },
    {
      field: 'relationships.latestChartVersion.data.created',
      label: 'Created',
      sortWith: (prevDate, nextDate) =>
        moment(prevDate).isBefore(nextDate) ? 1 : -1,
    },
  ]

  filtersConfig = () => [
    {
      field: 'clusterId',
      type: 'select',
      label: 'Cluster',
      onChange: async clusterId => {
        this.setState({ clusterId })
        this.props.reloadData(loadApps, { clusterId })
      },
      items: projectAs(
        { label: 'name', value: 'uuid' },
        [
          { name: 'all', uuid: '__all__' },
          ...this.props.context.clusters.filter(cluster => cluster.hasMasterNode),
        ],
      ),
    },
  ]

  render () {
    const {
      context: { apps = {} },
    } = this.props
    const { clusterId } = this.state
    return (
      <div className="applications">
        <CardTable
          data={apps[clusterId]}
          sorting={this.sortingConfig}
          filters={this.filtersConfig()}
          searchTarget="attributes.name"
        >
          {item => <ApplicationCard application={item} key={item.id} />}
        </CardTable>
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withDataLoader([
    loadClusters,
    loadApps,
  ]),
)(AppCatalogPage)

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
        this.props.reloadData('apps', { clusterId })
      },
      items: projectAs(
        { label: 'name', value: 'uuid' },
        [
          { name: 'all', uuid: '__all__' },
          ...this.props.data.clusters.filter(cluster => cluster.hasMasterNode),
        ],
      ),
    },
  ]

  render () {
    const {
      data: { apps },
    } = this.props
    return (
      <div className="applications">
        <CardTable
          data={apps}
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
  withDataLoader({
    clusters: loadClusters,
    apps: loadApps,
  }),
)(AppCatalogPage)

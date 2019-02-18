import Loader from 'core/components/Loader'
import { withDataLoader } from 'core/DataLoader'
import { loadApps } from 'k8s/components/apps/actions'
import { loadInfrastructure } from 'k8s/components/infrastructure/actions'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { compose, pathOr } from 'ramda'
import React from 'react'
import { projectAs } from 'utils/fp'
import CardTable from 'core/components/cardTable/CardTable'
import ApplicationCard from 'core/components/appCatalog/AppCard'
import moment from 'moment'

class AppCatalogPage extends React.Component {
  async componentDidMount () {
    const { context, setContext } = this.props
    // Make sure to use a new reference to props.context since it has now changed
    const clusters = context.clusters.filter(x => x.hasMasterNode)

    // Load apps for the first cluster
    await loadApps({
      params: { clusterId: pathOr('__all__', [0, 'uuid'], clusters) },
      context,
      setContext
    })
  }

  handleClusterChange = async clusterId => {
    const { context, setContext } = this.props
    await loadApps({
      params: { clusterId },
      context,
      setContext
    })
  }

  sortingConfig = [
    {
      field: 'attributes.name',
      label: 'Name'
    },
    {
      field: 'relationships.latestChartVersion.data.created',
      label: 'Created',
      sortWith: (prevDate, nextDate) =>
        moment(prevDate).isBefore(nextDate) ? 1 : -1
    }
  ]

  filtersConfig = () => [
    {
      field: 'clusterId',
      type: 'select',
      label: 'Cluster',
      onChange: this.handleClusterChange,
      items: projectAs(
        { label: 'name', value: 'uuid' },
        this.props.context.clusters.filter(x => x.hasMasterNode)
      )
    }
  ]

  render () {
    const {
      context: { clusters, apps }
    } = this.props

    if (!clusters || !apps) {
      return <Loader />
    }
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
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure })
)(AppCatalogPage)

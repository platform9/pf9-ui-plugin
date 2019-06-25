import React from 'react'
import { loadApps } from 'k8s/components/apps/actions'
import { projectAs } from 'utils/fp'
import CardTable from 'core/components/cardTable/CardTable'
import ApplicationCard from 'core/components/appCatalog/AppCard'
import moment from 'moment'
import clusterizedDataLoader from 'k8s/helpers/clusterizedDataLoader'

const sortingConfig = [
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

const filtersConfig = (clusters, clusterId, setParams) => [
  {
    field: 'clusterId',
    type: 'select',
    label: 'Cluster',
    value: clusterId,
    onChange: async clusterId => {
      setParams({ clusterId })
    },
    items: projectAs(
      { label: 'name', value: 'uuid' },
      [
        { name: 'all', uuid: '__all__' },
        ...clusters.filter(cluster => cluster.hasMasterNode),
      ],
    ),
  },
]

const AppCatalogPage = ({ data: { apps, clusters }, params, setParams }) =>
  <div className="applications">
    <CardTable
      data={apps}
      sorting={sortingConfig}
      filters={filtersConfig(clusters, params.clusterId, setParams)}
      searchTarget="attributes.name"
    >
      {item => <ApplicationCard application={item} key={item.id} />}
    </CardTable>
  </div>

export default clusterizedDataLoader('apps', loadApps)(AppCatalogPage)

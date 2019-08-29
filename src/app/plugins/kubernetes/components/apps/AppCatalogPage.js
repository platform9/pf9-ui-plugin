import React, { useState, useCallback } from 'react'
import CardTable from 'core/components/cardTable/CardTable'
import AppCard from 'k8s/components/apps/AppCard'
import moment from 'moment'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { emptyObj } from 'utils/fp'
import { appActions } from 'k8s/components/apps/actions'

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

const AppCatalogPage = () => {
  const [params, setParams] = useState(emptyObj)
  const handleClusterChange = useCallback(clusterId => setParams({ clusterId }), [])
  const [apps, loading, reload] = useDataLoader(appActions.list, params)
  const handleRefresh = useCallback(() => reload(true), [reload])
  const renderCardItems = useCallback(item =>
    <AppCard application={item} key={item.id} />, [])

  return <CardTable
    loading={loading}
    onRefresh={handleRefresh}
    data={apps}
    sorting={sortingConfig}
    searchTarget="attributes.name"
    filters={<>
      <ClusterPicklist
        onChange={handleClusterChange}
        value={params.clusterId} />
    </>}
  >
    {renderCardItems}
  </CardTable>
}

export default AppCatalogPage

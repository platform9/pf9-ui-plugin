import React, { useState, useMemo, useCallback } from 'react'
import CardTable from 'core/components/cardTable/CardTable'
import AppCard from 'k8s/components/apps/AppCard'
import moment from 'moment'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { emptyObj } from 'utils/fp'

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
  const [apps, loading, reload] = useDataLoader('apps', params)
  // reload(true) refetches the data from server
  const handleRefresh = useCallback(() => reload(true), [reload])
  const renderFilters = useMemo(() => <>
    <ClusterPicklist
      onChange={clusterId => setParams({ clusterId })}
      value={params.clusterId} />
  </>, [params.clusterId])

  return <CardTable
    loading={loading}
    onRefresh={handleRefresh}
    data={apps}
    sorting={sortingConfig}
    searchTarget="attributes.name"
    filters={renderFilters}
  >
    {item => <AppCard application={item} key={item.key} />}
  </CardTable>
}

export default AppCatalogPage

// Libs
import React, { useCallback } from 'react'

// Actions
import { cloudProviderActions } from './actions'

// Components
import ListPageHeader from 'k8s/components/common/ListPageHeader'

// Helpers
import { getUsageTotals } from 'k8s/util/calcUsageTotals'

// Types
import { cloudStatusCardProps } from 'k8s/components/dashboard/DashboardPage'
import { flatten, pluck } from 'ramda'
import { ICloudProvider } from './model'

const maxUsagePaths = {
  computeMaxPath: 'usage.compute.max',
  memoryMaxPath: 'usage.memory.max',
  diskMaxPath: 'usage.disk.max',
}

const curUsagePaths = {
  computeCurrPath: 'usage.compute.current',
  memoryCurrPath: 'usage.memory.current',
  diskCurrPath: 'usage.disk.current',
}

export const CloudProviderListHeader = () => {
  const handleGetUsage = useCallback((cloudProviders: ICloudProvider[]) => {
    const items = flatten(pluck('clusters', cloudProviders))
    return getUsageTotals(items, curUsagePaths, maxUsagePaths)
  }, [])
  return (
    <ListPageHeader<ICloudProvider>
      report={cloudStatusCardProps}
      loaderFn={cloudProviderActions.list}
      totalUsageFn={handleGetUsage}
    />
  )
}

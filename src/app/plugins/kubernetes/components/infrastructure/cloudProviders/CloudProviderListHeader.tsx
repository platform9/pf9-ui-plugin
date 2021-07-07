// Libs
import React, { useCallback } from 'react'
import { flatten, pluck } from 'ramda'

// Actions
import { cloudProviderActions } from './actions'

// Components
import ListPageHeader from 'k8s/components/common/ListPageHeader'

// Helpers
import { getUsageTotals } from 'k8s/util/calcUsageTotals'

// Types
import { cloudStatusCardProps } from 'k8s/components/dashboard/card-templates'
import { ICloudProvidersSelector } from './model'
import DocumentMeta from 'core/components/DocumentMeta'

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
  const handleGetUsage = useCallback((cloudProviders: ICloudProvidersSelector[]) => {
    const items = flatten(pluck('clusters', cloudProviders))
    return getUsageTotals(items, curUsagePaths, maxUsagePaths)
  }, [])
  return (
    <ListPageHeader<ICloudProvidersSelector>
      report={cloudStatusCardProps}
      loaderFn={cloudProviderActions.list}
      totalUsageFn={handleGetUsage}
      documentMeta={<DocumentMeta title="Cloud Providers" />}
    />
  )
}

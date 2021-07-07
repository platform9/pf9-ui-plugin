// Libs
import React, { useCallback } from 'react'

// Actions
import { clusterActions } from './actions'

// Components
import ListPageHeader from 'k8s/components/common/ListPageHeader'

// Helpers
import { getUsageTotals } from 'k8s/util/calcUsageTotals'

// Types
import { clusterStatusCardProps } from 'k8s/components/dashboard/card-templates'
import { IClusterSelector } from './model'
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

export const ClusterListHeader = () => {
  const handleGetUsage = useCallback((clusters: IClusterSelector[]) => {
    const items = clusters.filter((cluster) => (cluster.nodes || []).length > 0)
    return getUsageTotals(items, curUsagePaths, maxUsagePaths)
  }, [])
  return (
    <>
      <ListPageHeader<IClusterSelector>
        report={clusterStatusCardProps}
        loaderFn={clusterActions.list}
        totalUsageFn={handleGetUsage}
        documentMeta={<DocumentMeta title="Clusters" />}
      />
    </>
  )
}

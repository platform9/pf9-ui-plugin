// Libs
import React, { useCallback } from 'react'

// Actions
import { loadNodes } from './actions'

// Components
import ListPageHeader from 'k8s/components/common/ListPageHeader'

// Helpers
import { getUsageTotals } from 'k8s/util/calcUsageTotals'

// Types
import { nodeStatusCardProps } from 'k8s/components/dashboard/DashboardPage'
import { ICombinedNode } from './model'

const maxUsagePaths = {
  computeMaxPath: 'combined.usage.compute.max',
  memoryMaxPath: 'combined.usage.memory.max',
  diskMaxPath: 'combined.usage.disk.max',
}

const curUsagePaths = {
  computeCurrPath: 'combined.usage.compute.current',
  memoryCurrPath: 'combined.usage.memory.current',
  diskCurrPath: 'combined.usage.disk.current',
}

export const NodeListHeader = () => {
  const handleGetUsage = useCallback((nodes: ICombinedNode[]) => {
    const items = nodes.filter((node) => !!node.clusterUuid)
    return getUsageTotals(items, curUsagePaths, maxUsagePaths)
  }, [])
  return (
    <ListPageHeader<ICombinedNode>
      report={nodeStatusCardProps}
      loaderFn={loadNodes}
      totalUsageFn={handleGetUsage}
    />
  )
}

import useDataLoader from 'core/hooks/useDataLoader'
import React, { useEffect } from 'react'
import { getImportedClusters, importedClusterActions } from './actions'

const ImportedClustersListPage = () => {
  const [clusters, loadingClusters] = useDataLoader(importedClusterActions.list)
  console.log(clusters, loadingClusters)
  useEffect(() => {
    const loadData = async () => {
      const clusters = await getImportedClusters()
      console.log(clusters)
    }
    loadData()
  }, [])
  return <div>List Page goes here</div>
}

export default ImportedClustersListPage

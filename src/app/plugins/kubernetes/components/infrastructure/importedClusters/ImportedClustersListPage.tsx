import React from 'react'
import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
// import useDataLoader from 'core/hooks/useDataLoader'
// import React, { useEffect } from 'react'
import { ActionDataKeys } from '../../../DataKeys'
// need to include the following lines somewhere or file never loads...
import { getImportedClusters, importedClusterActions } from './actions'
console.log(getImportedClusters, importedClusterActions)

const renderExternal = (_, { external }) => (external ? <div>External</div> : null)

const columns = [
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name' },
  { id: 'external', label: 'Type', render: renderExternal },
  { id: 'status', label: 'Status' },
  { id: 'region', label: 'Region' },
  { id: 'kubeVersion', label: 'Kubernetes Version' },
  // { id: '', label: 'Autoscaling'},
  // { id: '', label: 'Node Groups'},
  // { id: '', label: 'Container CIDR'},
  { id: 'creationTimestamp', label: 'Created', render: (value) => <DateAndTime value={value} /> },
]

export const options = {
  columns,
  cacheKey: ActionDataKeys.ImportedClusters,
  name: 'Imported Clusters',
  title: 'Imported Clusters',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
}

// const ImportedClustersListPage = () => {
//   const [clusters, loadingClusters] = useDataLoader(importedClusterActions.list)
//   console.log(clusters, loadingClusters)
//   useEffect(() => {
//     const loadData = async () => {
//       const clusters = await getImportedClusters()
//       console.log(clusters)
//     }
//     loadData()
//   }, [])
//   return <div>List Page goes here</div>
// }

const { ListPage } = createCRUDComponents(options)

export default ListPage

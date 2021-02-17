// import { ListTableToolbar } from 'core/components/listTable/ListTableToolbar'
import React, { useEffect } from 'react'

export const viewByAppColumns = [
  { id: 'application', label: 'Application' },
  { id: 'numClusters', label: '# of Clusters' },
  { id: 'cluster', label: 'Cluster' },
  { id: 'namespace', label: 'Namespace' },
  { id: 'version', label: 'App Version' },
  { id: 'deploymentName', label: 'Deployment Name' },
]

const DeployedAppsTableAppView = ({ extraLeftToolbarContent, setOnEdit }) => {
  useEffect(() => {}, [])
  return <span>Hello</span>
}

// export const appTableToolbarOptions = {
//   columns: viewByAppColumns,
//   onColumnToggle: () => console.log('column toggled'),
//   visibleColumn: [],
//   searchTerm: 'application',
//   onSearchChange: () => console.log('search changed'),
//   rowsPerPage: 10,
//   onChangeRowsPerPage: () => console.log('rows changed'),
//   onReload: () => console.log('reload'),
//   onEdit: () => console.log('edit'),
//   onDelete: () => console.log('edit'),
// }

// const DeployedAppsTableAppView = ({ extraLeftToolbarContent, setOnEdit }) => {
//   useEffect(() => {
//     setOnEdit(null)
//   }, [setOnEdit])
//   return (
//     <ListTableToolbar
//       columns={viewByAppColumns}
//       onColumnToggle={() => console.log('toggled')}
//       visibleColumns={[]}
//       extraToolbarContent={[]}
//       extraLeftToolbarContent={extraLeftToolbarContent}
//       onEdit={() => console.log('edit')}
//       onDelete={() => console.log('delete')}
//       searchTerm={'application'}
//       onSearchChange={() => console.log('search changed')}
//       rowsPerPage={10}
//       onChangeRowsPerPage={() => console.log('changed')}
//       onReload={() => console.log('reload')}
//     />
//   )
// }

export default DeployedAppsTableAppView

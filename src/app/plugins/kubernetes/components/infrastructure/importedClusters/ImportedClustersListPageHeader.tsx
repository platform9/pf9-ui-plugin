import React from 'react'
import { importedClusterActions } from './actions'

// Components
import ListPageHeader from 'k8s/components/common/ListPageHeader'

// Types
import { importedClusterStatusCardProps } from 'k8s/components/dashboard/card-templates'
import DocumentMeta from 'core/components/DocumentMeta'

export const ImportedClusterListHeader = () => {
  return (
    <>
      <ListPageHeader
        report={importedClusterStatusCardProps}
        loaderFn={importedClusterActions.list}
        documentMeta={<DocumentMeta title="Imported Clusters" />}
        hideUsage
      />
    </>
  )
}

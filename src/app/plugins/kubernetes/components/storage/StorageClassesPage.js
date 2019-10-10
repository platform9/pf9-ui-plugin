import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { storageClassesCacheKey } from 'k8s/components/storage/actions'
import PageContainer from 'core/components/pageContainer/PageContainer'

export const options = {
  addUrl: '/ui/kubernetes/storage_classes/add',
  addText: 'Add Storage Class',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'type', label: 'Type' },
    { id: 'provisioner', label: 'Provisioner' },
    { id: 'created', label: 'Created' },
  ],
  cacheKey: storageClassesCacheKey,
  name: 'StorageClasses',
  title: 'Storage Classes',
}

const { ListPage } = createCRUDComponents(options)

export default () => <PageContainer floatingHeader={false}>
  <ListPage />
</PageContainer>

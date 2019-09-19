import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { storageClassesCacheKey } from 'k8s/components/storage/actions'

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

const components = createCRUDComponents(options)
export const NodesList = components.List

export default components.ListPage

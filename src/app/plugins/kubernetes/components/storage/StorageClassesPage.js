import { deleteStorageClass, loadStorageClasses } from './actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'

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
  dataKey: 'storageClasses',
  deleteFn: deleteStorageClass,
  loaderFn: loadStorageClasses,
  name: 'StorageClasses',
  title: 'Storage Classes',
}

const components = createCRUDComponents(options)
export const NodesList = components.List

export default components.ListPage

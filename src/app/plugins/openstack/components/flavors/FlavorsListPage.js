import createCRUDComponents from 'core/createCRUDComponents'
import { deleteFlavor, loadFlavors } from './actions'

export const options = {
  baseUrl: '/ui/openstack/flavors',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'vcpus', label: 'VCPUs' },
    { id: 'ram', label: 'RAM' },
    { id: 'disk', label: 'Disk' },
    { id: 'tags', label: 'tags' }
  ],
  dataKey: 'flavors',
  deleteFn: deleteFlavor,
  loaderFn: loadFlavors,
  name: 'Flavors',
  title: 'Flavors',
}

const { ListPage, List } = createCRUDComponents(options)
export const FlavorsList = List

export default ListPage

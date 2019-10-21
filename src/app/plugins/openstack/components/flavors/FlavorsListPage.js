import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { flavorActions } from 'k8s/components/infrastructure/common/actions'

export const options = {
  addUrl: '/ui/openstack/flavors/add',
  addText: 'Add Flavor',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'vcpus', label: 'VCPUs' },
    { id: 'ram', label: 'RAM' },
    { id: 'disk', label: 'Disk' },
    { id: 'tags', label: 'tags' }
  ],
  loaderFn: flavorActions.list,
  updateFn: flavorActions.update,
  editUrl: '/ui/openstack/flavors/edit',
  actions: { service: 'nova', entity: 'flavors' },
  name: 'Flavors',
  title: 'Flavors',
}

const { ListPage, List } = createCRUDComponents(options)
export const FlavorsList = List

export default ListPage

import createCRUDComponents from 'core/createCRUDComponents'

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
  actions: { service: 'nova', entity: 'flavors' },
  name: 'Flavors',
  title: 'Flavors',
}

const { ListPage, List } = createCRUDComponents(options)
export const FlavorsList = List

export default ListPage

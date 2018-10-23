import createAddComponents from 'core/createAddComponents'
import { createFlavor, loadFlavors } from './actions'

const initialValue = {
  name: '',
  disk: 20,
  ram: 4096,
  vcpus: 2,
  public: false,
}

export const options = {
  formSpec: {
    initialValue,
    fields: [
      { id: 'name',  label: 'Name' },
      { id: 'vcpus', label: 'VCPUs', type: 'number' },
      { id: 'ram',   label: 'RAM',   type: 'number' },
      { id: 'disk',  label: 'Disk',  type: 'number' },
    ],
    submitLabel: 'Add Flavor',
  },
  createFn: createFlavor,
  loaderFn: loadFlavors,
  listUrl: '/ui/openstack/flavors',
  name: 'AddFlavor',
  title: 'Add Flavor',
}

const { AddPage } = createAddComponents(options)

export default AddPage

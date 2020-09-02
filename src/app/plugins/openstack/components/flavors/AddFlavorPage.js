import createAddComponents from 'core/helpers/createAddComponents'
import { ActionDataKeys } from 'k8s/DataKeys'

const initialValue = {
  name: '',
  disk: 20,
  ram: 4096,
  vcpus: 2,
  public: false,
}

// prettier-ignore
export const options = {
  formSpec: {
    initialValue,
    fields: [
      { id: 'name', label: 'Name' },
      { id: 'vcpus', label: 'VCPUs', type: 'number' },
      { id: 'ram', label: 'RAM', type: 'number' },
      { id: 'disk', label: 'Disk', type: 'number' },
    ],
    submitLabel: 'Add Flavor',
  },
  actions: { service: 'nova', entity: ActionDataKeys.Flavors },
  listUrl: '/ui/openstack/flavors',
  name: 'AddFlavor',
  title: 'Add Flavor',
}

const { AddPage } = createAddComponents(options)

export default AddPage

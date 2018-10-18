import React from 'react'
import createAddComponents from 'core/createAddComponents'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import { createFlavor, loadFlavors } from './actions'

const initialValue = {
  name: '',
  disk: 20,
  ram: 4096,
  vcpus: 2,
  public: false,
}

export const AddFlavorForm = ({ onComplete }) => (
  <ValidatedForm onSubmit={onComplete} initialValue={initialValue}>
    <TextField id="name" label="Name" />
    <TextField id="vcpus" label="VCPUs" type="number" />
    <TextField id="ram" label="RAM" type="number" />
    <TextField id="disk" label="Disk" type="number" />
    <SubmitButton>Add Flavor</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: AddFlavorForm,
  createFn: createFlavor,
  loaderFn: loadFlavors,
  listUrl: '/ui/openstack/flavors',
  name: 'AddFlavor',
  title: 'Add Flavor',
}

const { AddPage } = createAddComponents(options)

export default AddPage

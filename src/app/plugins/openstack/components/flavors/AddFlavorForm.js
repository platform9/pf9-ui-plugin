import React from 'react'
import { ADD_FLAVOR, GET_FLAVORS } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const initialValue = {
  name: '',
  disk: 20,
  ram: 4096,
  vcpus: 2,
  public: false,
}

const AddFlavorForm = () =>
  <ValidatedForm
    initialValue={initialValue}
    backUrl="/ui/openstack/flavors"
    action="add"
    addQuery={ADD_FLAVOR}
    getQuery={GET_FLAVORS}
    objType="flavors"
    cacheQuery="createFlavor"
  >
    <TextField id="name" label="Name" />
    <TextField id="vcpus" label="VCPUs" type="number" />
    <TextField id="ram" label="RAM" type="number" />
    <TextField id="disk" label="Disk" type="number" />
    <Button type="submit" variant="raised">Add Flavor</Button>
  </ValidatedForm>

export default AddFlavorForm

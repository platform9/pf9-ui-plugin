import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const initialValue = {
  size: 0,
  bootable: false,
  readonly: false,
}

const AddVolumeForm = ({ onSubmit }) =>
  <ValidatedForm initialValue={initialValue} onSubmit={onSubmit}>
    <TextField id="name" label="Volume Name" />
    <TextField id="volume_type" label="Volume Type" />
    <TextField id="description" label="Description" />
    <TextField id="status" label="Status" />
    <TextField id="tenant" label="Tenant" />
    <TextField id="source" label="Source" />
    <TextField id="host" label="Host" />
    <TextField id="instance" label="Instance" />
    <TextField id="device" label="Device" />
    <TextField id="size" label="Capacity" type="number" />
    <Checkbox id="bootable" label="Bootable" />
    <Checkbox id="attachedMode" label="Attached Mode" />
    <Checkbox id="readonly" label="Read only?" />
    <TextField id="metadata" label="Metadata" />
    <Button type="submit" variant="raised">Add User</Button>
  </ValidatedForm>

AddVolumeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddVolumeForm

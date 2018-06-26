import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateVolumeForm = ({ onSubmit, ...initialValue }) =>
  <ValidatedForm initialValue={initialValue} onSubmit={onSubmit}>
    <TextField id="name" label="Volume Name" />
    <TextField id="description" label="Description" />
    <Checkbox id="bootable" label="Bootable" />
    <Button type="submit" variant="raised">Update Volume</Button>
  </ValidatedForm>

UpdateVolumeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default UpdateVolumeForm

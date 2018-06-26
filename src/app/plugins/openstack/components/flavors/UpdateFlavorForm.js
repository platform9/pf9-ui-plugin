import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const UpdateFlavorForm = ({ onSubmit, ...initialValues }) =>
  <ValidatedForm initialValue={initialValues} onSubmit={onSubmit}>
    <TextField id="name" label="Name" disabled />
    <TextField id="tags" label="Tags" />
    <Button type="submit" variant="raised">Update Flavor</Button>
  </ValidatedForm>

UpdateFlavorForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

export default UpdateFlavorForm

import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateGlanceImageForm = ({ onSubmit, ...initialValues }) =>
  <ValidatedForm initialValue={initialValues} onSubmit={onSubmit}>
    <TextField id="name" label="Name" />
    <TextField id="description" label="description" />
    <TextField id="owner" label="Tenant" />
    <TextField id="visibility" label="Visibility" />
    <Checkbox id="protected" label="Protected" />
    <TextField id="tags" label="Tags" />
    <Button type="submit" variant="raised">Update Flavor</Button>
  </ValidatedForm>

UpdateGlanceImageForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

export default UpdateGlanceImageForm

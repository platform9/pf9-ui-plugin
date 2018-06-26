import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const AddTenantForm = ({ onSubmit }) =>
  <ValidatedForm onSubmit={onSubmit}>
    <TextField id="name" label="Name" />
    <TextField id="description" label="Description" />
    <Button type="submit" variant="raised">Add Tenant</Button>
  </ValidatedForm>

AddTenantForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddTenantForm

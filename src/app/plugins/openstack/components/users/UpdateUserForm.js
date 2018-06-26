import React from 'react'
import PropTypes from 'prop-types'
import NoAutofillHack from 'core/common/NoAutofillHack'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

// As of Chrome 66, Google has disabled the NoAutofillHack and still does
// not respect the HTML spec for autocomplete="off".  After some experimentation
// it looks like autocomplete="new-password" works.
const UpdateUserForm = ({ onSubmit, ...initialValues }) =>
  <ValidatedForm initialValue={initialValues} onSubmit={onSubmit} autoComplete="new-password">
    <NoAutofillHack />
    <TextField id="name" label="Name" />
    <TextField id="email" label="Email" />
    <TextField id="username" label="Username" />
    <TextField id="displayname" label="Display Name" />
    <TextField id="password" label="Password" type="password" />
    <Button type="submit" variant="raised">Update User</Button>
  </ValidatedForm>

UpdateUserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default UpdateUserForm

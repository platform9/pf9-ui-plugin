import React from 'react'
import createAddComponents from 'core/helpers/createAddComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import NoAutofillHack from 'core/components/NoAutofillHack'
import TenantRolesContainer from 'core/components/validatedForm/TenantRolesContainer'
import userActions from './actions'

const roles = ['None', 'Role1', 'Role2', 'Role3']

// As of Chrome 66, Google has disabled the NoAutofillHack and still does
// not respect the HTML spec for autocomplete="off".  After some experimentation
// it looks like autocomplete="new-password" works.
export const AddUserForm = ({ onComplete }) => (
  <ValidatedForm onSubmit={onComplete}>
    <NoAutofillHack />
    <TextField id="name" label="Name" />
    <TextField id="email" label="Email" />
    <TextField id="username" label="Username" />
    <TextField id="displayname" label="Display Name" />
    <TextField id="password" label="Password" type="password" />
    <TenantRolesContainer
      id="rolePair"
      label="TenantRoleSelectors"
      roles={roles}
    />
    <SubmitButton>Add User</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: AddUserForm,
  loaderFn: userActions.list,
  updateFn: userActions.update,
  listUrl: '/ui/openstack/users',
  name: 'AddUser',
  title: 'Add User',
}

const { AddPage } = createAddComponents(options)

export default AddPage

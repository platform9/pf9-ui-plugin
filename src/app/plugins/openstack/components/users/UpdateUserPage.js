import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import NoAutofillHack from 'core/components/NoAutofillHack'
import TenantRolesContainer from 'openstack/components/users/TenantRolesContainer'
import { ActionDataKeys } from 'k8s/DataKeys'

const roles = ['None', 'Role1', 'Role2', 'Role3']

// As of Chrome 66, Google has disabled the NoAutofillHack and still does
// not respect the HTML spec for autocomplete="off".  After some experimentation
// it looks like autocomplete="new-password" works.
export const UpdateUserForm = ({ onComplete, initialValue }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValue}>
    <NoAutofillHack />
    <TextField id="name" label="Name" />
    <TextField id="email" label="Email" />
    <TextField id="username" label="Username" />
    <TextField id="displayname" label="Display Name" />
    <TextField id="password" label="Password" type="password" />
    <TenantRolesContainer id="rolePair" label="TenantRoleSelectors" roles={roles} />
    <SubmitButton>Update User</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: UpdateUserForm,
  routeParamKey: 'userId',
  cacheKey: ActionDataKeys.Users,
  listUrl: '/ui/openstack/routers',
  name: 'UpdateUser',
  title: 'Update User',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage

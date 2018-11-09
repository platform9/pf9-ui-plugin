import React from 'react'
import createUpdateComponents from 'core/createUpdateComponents'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'
import NoAutofillHack from 'core/common/NoAutofillHack'
import TenantRolesContainer
  from 'core/common/validated_form/TenantRolesContainer'
import { loadUsers, updateUser } from './actions'
import { loadTenants } from '../tenants/actions'

// As of Chrome 66, Google has disabled the NoAutofillHack and still does
// not respect the HTML spec for autocomplete="off".  After some experimentation
// it looks like autocomplete="new-password" works.
export const UpdateUserForm = ({ onComplete, initialValue, context }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValue}>
    <NoAutofillHack />
    <TextField id="name" label="Name" />
    <TextField id="email" label="Email" />
    <TextField id="username" label="Username" />
    <TextField id="displayname" label="Display Name" />
    <TextField id="password" label="Password" type="password" />
    <TenantRolesContainer
      id="rolePair"
      label="TenantRoleSelectors"
      tenants={context.tenants}
      roles={['None', 'Role1', 'Role2', 'Role3']}
    />
    <SubmitButton>Update User</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: UpdateUserForm,
  routeParamKey: 'userId',
  updateFn: updateUser,
  initFn: loadTenants,
  loaderFn: loadUsers,
  listUrl: '/ui/openstack/routers',
  name: 'UpdateUser',
  title: 'Update User',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage

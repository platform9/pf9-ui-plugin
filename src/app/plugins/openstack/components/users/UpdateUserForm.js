import React from 'react'
import { UPDATE_USER } from './actions'
import NoAutofillHack from 'core/common/NoAutofillHack'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import TenantRoleSelectorContainer from 'core/common/TenantRoleSelectorContainer'

// As of Chrome 66, Google has disabled the NoAutofillHack and still does
// not respect the HTML spec for autocomplete="off".  After some experimentation
// it looks like autocomplete="new-password" works.
const UpdateUserForm = ({ user, objId, tenants }) =>
  <ValidatedForm
    initialValue={user}
    autoComplete="new-password"
    objId={objId}
    updateQuery={UPDATE_USER}
    action="update"
    backUrl="/ui/openstack/users"
  >
    <NoAutofillHack />
    <TextField id="name" label="Name" />
    <TextField id="email" label="Email" />
    <TextField id="username" label="Username" />
    <TextField id="displayname" label="Display Name" />
    <TextField id="password" label="Password" type="password" />
    <TenantRoleSelectorContainer
      id="rolePair"
      label="TenantRoleSelectors"
      tenants={tenants}
      roles={['None', 'Role1', 'Role2', 'Role3']}
    />
    <Button type="submit" variant="raised">Update User</Button>
  </ValidatedForm>

export default UpdateUserForm

import React from 'react'
import { ADD_USER, GET_USERS } from './actions'
import NoAutofillHack from 'core/common/NoAutofillHack'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import TenantRolesContainer from 'core/common/TenantRolesContainer'

// As of Chrome 66, Google has disabled the NoAutofillHack and still does
// not respect the HTML spec for autocomplete="off".  After some experimentation
// it looks like autocomplete="new-password" works.
class AddUserForm extends React.Component {
  render () {
    return (
      <ValidatedForm
        backUrl="/ui/openstack/users"
        action="add"
        addQuery={ADD_USER}
        getQuery={GET_USERS}
        objType="users"
        cacheQuery="createUser"
      >
        <NoAutofillHack />
        <TextField id="name" label="Name" />
        <TextField id="email" label="Email" />
        <TextField id="username" label="Username" />
        <TextField id="displayname" label="Display Name" />
        <TextField id="password" label="Password" type="password" />
        <TenantRolesContainer
          id="rolePair"
          label="TenantRoleSelectors"
          tenants={this.props.tenants}
          roles={['None', 'Role1', 'Role2', 'Role3']}
        />
        <Button type="submit" variant="raised">Add User</Button>
      </ValidatedForm>
    )
  }
}

export default AddUserForm

import React from 'react'
import { ADD_SSH_KEY, GET_SSH_KEYS } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const AddSshKeyForm = () =>
  <ValidatedForm
    backUrl="/ui/openstack/sshkeys"
    action="add"
    addQuery={ADD_SSH_KEY}
    getQuery={GET_SSH_KEYS}
    objType="sshKeys"
    cacheQuery="createSshKey"
  >
    <TextField id="name" label="Name" />
    <TextField id="public_key" label="Public Key" />
    <Button type="submit" variant="raised">Add SSH Key</Button>
  </ValidatedForm>

export default AddSshKeyForm

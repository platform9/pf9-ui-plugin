import React from 'react'
import PropTypes from 'prop-types'
import { UPDATE_NETWORK } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateNetworkForm = ({ network, client, history, workId, type, backUrl }) =>
  <ValidatedForm
    initialValue={network}
    client={client}
    history={history}
    workId={workId}
    type={type}
    updateQuery={UPDATE_NETWORK}
    backUrl={backUrl}
  >
    <TextField id="name" label="Name" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <Checkbox id="port_security_enabled" label="Port Security" />
    <Checkbox id="shared" label="Shared" />
    <Checkbox id="external" label="External Network" />
    <Button type="submit" variant="raised">Update Network</Button>
  </ValidatedForm>

export default UpdateNetworkForm

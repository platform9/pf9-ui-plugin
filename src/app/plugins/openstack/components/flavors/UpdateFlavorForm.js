import React from 'react'
import { UPDATE_FLAVOR } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const UpdateFlavorForm = ({ flavor, client, history, workId }) =>
  <ValidatedForm
    initialValue={flavor}
    client={client}
    history={history}
    workId={workId}
    updateQuery={UPDATE_FLAVOR}
    type="update"
    backUrl="/ui/openstack/flavors"
  >
    <TextField id="name" label="Name" disabled />
    <TextField id="tags" label="Tags" />
    <Button type="submit" variant="raised">Update Flavor</Button>
  </ValidatedForm>

export default UpdateFlavorForm

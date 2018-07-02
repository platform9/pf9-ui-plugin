import React from 'react'
import { UPDATE_VOLUME } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateVolumeForm = ({ volume, client, history, workId }) =>
  <ValidatedForm
    initialValue={volume}
    client={client}
    history={history}
    workId={workId}
    updateQuery={UPDATE_VOLUME}
    type="update"
    backUrl="/ui/openstack/volumes"
  >
    <TextField id="name" label="Volume Name" />
    <TextField id="description" label="Description" />
    <Checkbox id="bootable" label="Bootable" />
    <Button type="submit" variant="raised">Update Volume</Button>
  </ValidatedForm>

export default UpdateVolumeForm

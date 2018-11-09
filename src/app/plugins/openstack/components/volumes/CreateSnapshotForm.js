import React from 'react'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'

const CreateSnapshotForm = ({ onComplete }) =>
  <ValidatedForm
    backUrl="/ui/openstack/storage#volumes"
    onSubmit={onComplete}
  >
    <TextField id="name" label="Volume Name" />
    <TextField id="description" label="Description" />
    <Button type="submit" variant="raised">Snapshot Volume</Button>
  </ValidatedForm>

export default CreateSnapshotForm

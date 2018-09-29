import React from 'react'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import KeyValuesField from 'core/common/KeyValuesField'

const AddVolumeTypeForm = ({ onComplete }) =>
  <ValidatedForm
    backUrl="/ui/openstack/storage#volumeTypes"
    onSubmit={onComplete}
  >
    <p>
      A Cinder Volume Type allows you to create a Storage Tier and optionally
      specify Quality of Service parameters specific to your Cinder endpoint.
      Once created, a Volume Type can be used by end users during creation of
      a Volume.
    </p>
    <p>
      This Volume Type will be associated with your current default Cinder
      driver type / endpoint.
    </p>

    <TextField id="name" label="Name" />
    <KeyValuesField id="metadata" label="Metadata" />

    <SubmitButton>Add Volume Type</SubmitButton>
  </ValidatedForm>

export default AddVolumeTypeForm

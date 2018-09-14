import React from 'react'
import Wizard from 'core/common/Wizard'
import WizardStep from 'core/common/WizardStep'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import PicklistField from 'core/common/PicklistField'
import Checkbox from 'core/common/Checkbox'

const initialValue = {
  size: 0,
  bootable: false,
  readonly: false,
}
const volumeSourceTypes = [
  {value: 'None', label: 'None (empty volume)'},
  'Snapshot',
  'Another Volume',
  'Image'
]

// See if the data supplied to WizardStep can be raised up to AddVolumeForm state
const AddVolumeForm = ({ onComplete }) =>
  <Wizard onComplete={onComplete} context={initialValue}>
    {({ context, setContext, onNext }) => {
      return (
        <div>
          <WizardStep stepId="basic" label="Basic">
            <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
              <TextField id="name" label="Volume Name" />
              <PicklistField id="volume_type" label="Volume Type" options={volumeSourceTypes} initialValue="None" />
              <TextField id="description" label="Description" />
              <TextField id="status" label="Status" />
            </ValidatedForm>
          </WizardStep>
          <WizardStep stepId="advanced" label="Advanced">
            <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
              <TextField id="tenant" label="Tenant" />
              <TextField id="source" label="Source" />
              <TextField id="host" label="Host" />
              <TextField id="instance" label="Instance" />
              <TextField id="device" label="Device" />
            </ValidatedForm>
          </WizardStep>
          <WizardStep stepId="config" label="Config">
            <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
              <TextField id="size" label="Capacity" type="number" />
              <Checkbox id="bootable" label="Bootable" />
              <Checkbox id="attachedMode" label="Attached Mode" />
              <Checkbox id="readonly" label="Read only?" />
              <TextField id="metadata" label="Metadata" />
            </ValidatedForm>
          </WizardStep>
          <pre>{JSON.stringify(context, null, 4)}</pre>
        </div>
      )
    }}
  </Wizard>

export default AddVolumeForm

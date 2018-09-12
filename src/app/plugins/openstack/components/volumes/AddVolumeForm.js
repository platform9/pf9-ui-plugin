import React from 'react'
import Wizard from 'core/common/Wizard'
import WizardStep from 'core/common/WizardStep'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Picklist from 'core/common/Picklist'
import Checkbox from 'core/common/Checkbox'

const initialValue = {
  size: 0,
  bootable: false,
  readonly: false,
}
const sourceTypes = [
  {value: 'None', label: 'None (empty volume)'},
  'Snapshot',
  'Another Volume',
  'Image'
]

// See if the data supplied to WizardStep can be raised up to AddVolumeForm state
class AddVolumeForm extends React.Component {
  state = { sourceType: '' }

  setSourceType = value => {
    this.setState({ sourceType: value })
  }

  render () {
    const { onComplete } = this.props
    const { sourceType } = this.state
    return (
      <Wizard onComplete={onComplete} context={initialValue}>
        {({ context, setContext, onNext, activeStepId }) => {
          return (
            <div>
              <WizardStep stepId="source" label="Source" activeStepId={activeStepId}>
                <Picklist name="sourceType" label="Volume Source" value={sourceType} onChange={this.setSourceType} options={sourceTypes} />
              </WizardStep>
              <WizardStep stepId="basic" label="Basic" activeStepId={activeStepId}>
                <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
                  <TextField id="name" label="Volume Name" />
                  <TextField id="description" label="Description" />
                </ValidatedForm>
              </WizardStep>
              <WizardStep stepId="advanced" label="Advanced" activeStepId={activeStepId}>
                <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
                  <TextField id="tenant" label="Tenant" />
                  <TextField id="source" label="Source" />
                  <TextField id="host" label="Host" />
                  <TextField id="instance" label="Instance" />
                  <TextField id="device" label="Device" />
                </ValidatedForm>
              </WizardStep>
              <WizardStep stepId="config" label="Config" activeStepId={activeStepId}>
                <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
                  <TextField id="size" label="Capacity (GB)" type="number" />
                  <Checkbox id="bootable" label="Bootable" />
                  <Checkbox id="attachedMode" label="Attached Mode" />
                  <Checkbox id="readonly" label="Read only?" />
                  <TextField id="metadata" label="Metadata" />
                </ValidatedForm>
              </WizardStep>
              <pre>{JSON.stringify(context, null, 4)}</pre>
              <pre>{JSON.stringify(this.state, null, 4)}</pre>
            </div>
          )
        }}
      </Wizard>
    )
  }
}

export default AddVolumeForm

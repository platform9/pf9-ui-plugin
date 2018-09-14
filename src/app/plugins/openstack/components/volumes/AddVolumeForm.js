import React from 'react'
import Wizard from 'core/common/Wizard'
import WizardStep from 'core/common/WizardStep'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Picklist from 'core/common/Picklist'
import PicklistField from 'core/common/PicklistField'
import Checkbox from 'core/common/Checkbox'
import DataLoader from 'core/DataLoader'
import { range } from 'core/fp'
import { loadVolumeTypes } from './actions'

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

const schemaSamples = (prefix, num) => range(1, num).map(i => `${prefix}${i}`)

// See if the data supplied to WizardStep can be raised up to AddVolumeForm state
class AddVolumeForm extends React.Component {
  state = {
    createMultiple: false,
    name: '',
    numVolumes: 1,
    sourceType: 'None',
  }

  setField = key => value => {
    this.setState({ [key]: value })
    if (key === 'createMultiple') {
      this.setState({ prefix: this.state.name })
    }
  }

  render () {
    const { onComplete } = this.props
    const { createMultiple, prefix, numVolumes, sourceType } = this.state
    return (
      <Wizard onComplete={onComplete} context={initialValue}>
        {({ context, setContext, onNext, activeStepId }) => {
          return (
            <div>
              <WizardStep stepId="source" label="Source" activeStepId={activeStepId}>
                <Picklist name="sourceType" label="Volume Source" value={sourceType} onChange={this.setField('sourceType')} options={sourceTypes} />
                {sourceType === 'Snapshot' &&
                  <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
                    <h1>Snapshot</h1>
                  </ValidatedForm>
                }
                {sourceType === 'Another Volume' &&
                  <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
                    <h1>Another Volume</h1>
                  </ValidatedForm>
                }
                {sourceType === 'Image' &&
                  <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
                    <h1>Image</h1>
                  </ValidatedForm>
                }
              </WizardStep>

              <WizardStep stepId="basic" label="Basic" activeStepId={activeStepId}>
                <DataLoader dataKey="volumeTypes" loaderFn={loadVolumeTypes}>
                  {({ data }) =>
                    <ValidatedForm initialValue={context} onSubmit={setContext} triggerSubmit={onNext}>
                      <TextField id="name" label="Volume Name" onChange={this.setField('name')} />
                      <TextField id="description" label="Description" />
                      <PicklistField id="volumeType" label="Volume Type" options={(data || []).map(x => x.name)} />
                      <TextField id="size" label="Capacity (GB)" type="number" />
                      <Checkbox id="bootable" label="Bootable" />
                      <Checkbox id="createMultiple" label="Create multiple?" onChange={this.setField('createMultiple')} />
                      {createMultiple &&
                        <React.Fragment>
                          <TextField id="numVolumes" label="Number of volumes" type="number" initialValue="1" onChange={this.setField('numVolumes')} />
                          <TextField id="volumeNamePrefix" label="Volume name prefix" initialValue={this.state.name} />
                          <br />
                          {schemaSamples(prefix, Math.min(numVolumes, 3)).map(str => <div key={str}>{str}</div>)}
                        </React.Fragment>
                      }
                    </ValidatedForm>
                  }
                </DataLoader>
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
    )
  }
}

export default AddVolumeForm

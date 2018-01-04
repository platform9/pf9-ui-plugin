/* eslint-disable camelcase */
import React from 'react'
import Wizard from 'core/components/Wizard'
import WizardStep from 'core/components/WizardStep'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import Picklist from 'core/components/Picklist'
import PicklistField from 'core/components/validatedForm/PicklistField'
import Checkbox from 'core/components/validatedForm/Checkbox'
import DataLoader from 'core/DataLoader'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import ImageChooser from '../images/ImageChooser.js'
import VolumeChooser from './VolumeChooser'
import VolumeSnapshotChooser from './VolumeSnapshotChooser'
import { range } from 'core/../../../../utils/fp'
import { loadVolumes, loadVolumeSnapshots, loadVolumeTypes } from './actions'
import { loadImages } from '../images/actions'

const initialValue = {
  bootable: false,
  numVolumes: 1,
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

  handleComplete = data => {
    const { onComplete } = this.props
    const { sourceType } = this.state
    const { snapshot_id, volume_id, imageRef, ...volume } = data
    if (sourceType === 'Snapshot') { volume.snapshot_id = snapshot_id }
    if (sourceType === 'Another Volume') { volume.volume_id = volume_id }
    if (sourceType === 'Image') { volume.imageRef = imageRef }
    onComplete(volume)
  }

  render () {
    const { createMultiple, prefix, numVolumes, sourceType } = this.state
    return (
      <Wizard onComplete={this.handleComplete} context={initialValue} submitLabel="Add Volume">
        {({ wizardContext, setWizardContext, onNext }) => {
          return (
            <div>
              <WizardStep stepId="source" label="Source">
                <Picklist name="sourceType" label="Volume Source" value={sourceType} onChange={this.setField('sourceType')} options={sourceTypes} />
                {sourceType === 'Snapshot' &&
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <DataLoader dataKey="volumeSnapshots" loaderFn={loadVolumeSnapshots}>
                      {({ data }) =>
                        <VolumeSnapshotChooser data={data} onChange={value => setWizardContext({ snapshot_id: value })} initialValue={wizardContext.snapshot_id} />
                      }
                    </DataLoader>
                  </ValidatedForm>
                }
                {sourceType === 'Another Volume' &&
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <DataLoader dataKey="volumes" loaderFn={loadVolumes}>
                      {({ data }) =>
                        <VolumeChooser data={data} onChange={value => setWizardContext({ volume_id: value })} initialValue={wizardContext.volume_id} />
                      }
                    </DataLoader>
                  </ValidatedForm>
                }
                {sourceType === 'Image' &&
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <DataLoader dataKey="images" loaderFn={loadImages}>
                      {({ data }) =>
                        <ImageChooser data={data} onChange={value => setWizardContext({ imageRef: value })} initialValue={wizardContext.imageRef} />
                      }
                    </DataLoader>
                  </ValidatedForm>
                }
              </WizardStep>

              <WizardStep stepId="basic" label="Basic">
                <DataLoader dataKey="volumeTypes" loaderFn={loadVolumeTypes}>
                  {({ data }) =>
                    <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                      <TextField id="name" label="Volume Name" onChange={this.setField('name')} />
                      <TextField id="description" label="Description" />
                      <PicklistField id="volumeType" label="Volume Type" options={(data || []).map(x => x.name)} showNone />
                      <TextField id="size" label="Capacity (GB)" type="number" initialValue={1} />
                      <Checkbox id="bootable" label="Bootable" />
                      <Checkbox id="createMultiple" label="Create multiple?" onChange={this.setField('createMultiple')} />
                      {createMultiple &&
                        <React.Fragment>
                          <TextField id="numVolumes" label="Number of volumes" type="number" onChange={this.setField('numVolumes')} />
                          <TextField id="volumeNamePrefix" label="Volume name prefix" initialValue={this.state.name} />
                          <br />
                          {schemaSamples(prefix, Math.min(numVolumes, 3)).map(str => <div key={str}>{str}</div>)}
                        </React.Fragment>
                      }
                    </ValidatedForm>
                  }
                </DataLoader>
              </WizardStep>

              <WizardStep stepId="metadata" label="Metadata">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  <KeyValuesField id="metadata" label="Metadata" />
                </ValidatedForm>
              </WizardStep>
            </div>
          )
        }}
      </Wizard>
    )
  }
}

export default AddVolumeForm

import React, { useState } from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import ExternalLink from 'core/components/ExternalLink'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/Wizard'
import WizardStep from 'core/components/WizardStep'
import createAddComponents from 'core/helpers/createAddComponents'
import useAsyncDataLoader from 'core/hooks/useAsyncDataLoader'
import { Typography } from '@material-ui/core'
import { loadStorageClasses, createStorageClass } from './actions'
import { projectAs } from 'utils/fp'

/*
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
*/

const AddStorageClass = () => {
  const [clusterId, setClusterId] = useState('')
  const clusters = useAsyncDataLoader('clusters', [])
  const clusterOptions = projectAs({
    value: 'uuid',
    label: 'name',
  }, clusters)

  // propEq won't work here for some strange reason "Object(...) is not a function"
  const cluster = clusters.find(x => x.uuid === clusterId)

  const handleComplete = () => {
    console.log('handleComplete TODO')
  }

  const persistentVolumesLink = (
    <ExternalLink newWindow url="https://kubernetes.io/docs/concepts/storage/persistent-volumes/#storageclasses">
      this article
    </ExternalLink>
  )

  const storageTypeOptions = ['gp2', 'io1', 'sc1', 'st1']
  // Storage types are only valid for AWS
  const showStorageType = cluster && cluster.cloudProviderType === 'aws'

  return (
    <Wizard onComplete={handleComplete} submitLabel="Add Storage Class">
      {({ wizardContext, setWizardContext, onNext }) => (
        <React.Fragment>
          <WizardStep stepId="basic" label="Basic">
            <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
              <Typography variant="body1">
                Create a new storage class on a specific cluster by specifying the storage type
                that maps to the cloud provider for that cluster.
              </Typography>
              <TextField id="name" label="Name" required />
              <PicklistField id="cluster" label="Cluster" options={clusterOptions} onChange={setClusterId} />
              {showStorageType && <PicklistField id="storageType" label="Storage Type" options={storageTypeOptions} />}
              <CheckboxField id="useAsDefault" label="Use as Default Storage Class" />
              <pre style={{ maxWidth: '600px' }}>{JSON.stringify(cluster, null, 4)}</pre>
            </ValidatedForm>
          </WizardStep>
          <WizardStep stepId="customize" label="Customize">
            <Typography variant="body1">
              Optionally edit the storage class YAML for advanced configuration.
              See {persistentVolumesLink} for more information.
            </Typography>
            <Typography variant="body1">
              <b>NOTE</b>: In case of a conflict with options selected on the previous page, changes you make here will
              override them.
            </Typography>
          </WizardStep>
        </React.Fragment>
      )}
    </Wizard>
  )
}

/*

export class AddStorageClass extends React.Component {
  state = {
    clusterOptions: [],
    namespaceOptions: [],
  }

  handleClusterChange = value => {
    const { data } = this.props
    const namespaceOptions = data.namespaces.filter(n => n.clusterId === value).map(
      n => ({ value: n.name, label: n.name }))
    this.setState({ namespaceOptions })
  }

  render () {
    const { namespaceOptions } = this.state
    const { data, onComplete } = this.props

    const codeMirrorOptions = {
      mode: 'yaml',
    }

    const clusterOptions = data.clusters ? projectAs({
      value: 'uuid',
      label: 'name',
    }, data.clusters) : []

    return (
      <ValidatedForm onSubmit={onComplete}>
        <PicklistField id="clusterId"
          label="Cluster"
          onChange={this.handleClusterChange}
          options={clusterOptions}
          validations={{ required: true }}
        />
        <PicklistField id="namespace"
          label="Namespace"
          options={namespaceOptions}
          validations={{ required: true }}
        />
        <CodeMirror
          id="podYaml"
          label="Pod YAML"
          options={codeMirrorOptions}
          validations={{ required: true }}
        />
        <SubmitButton>Create Pod</SubmitButton>
      </ValidatedForm>
    )
  }
}

*/

export const options = {
  FormComponent: AddStorageClass,
  createFn: createStorageClass,
  loaderFn: loadStorageClasses,
  listUrl: '/ui/kubernetes/storage_classes',
  name: 'AddStorageClass',
  title: 'Create Storage Class',
}

const { AddPage } = createAddComponents(options)

export default AddPage

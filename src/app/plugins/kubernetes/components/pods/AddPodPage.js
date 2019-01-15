import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import { projectAs } from 'utils/fp'
import { loadInfrastructure } from '../infrastructure/actions'
import { loadPods, createPod } from './actions'
import DataLoader from 'core/DataLoader'
import CodeMirror from 'core/components/validatedForm/CodeMirror'

export class AddPodForm extends React.Component {
  state = {
    clusterOptions: [],
    namespaceOptions: [],
  }

  handleClusterChange = value => {
    const { context } = this.props
    const namespaceOptions = context.namespaces.filter(n => n.clusterId === value).map(n => ({ value: n.name, label: n.name }))
    this.setState({ namespaceOptions })
  }

  render () {
    const { namespaceOptions } = this.state
    const { context, onComplete } = this.props

    const codeMirrorOptions = {
      mode: 'yaml',
    }

    const clusterOptions = context.clusters ? projectAs({ value: 'uuid', label: 'name' }, context.clusters) : []

    return (
      <DataLoader dataKey="clusters" loaderFn={loadInfrastructure}>
        {({ data }) =>
          <ValidatedForm onSubmit={onComplete}>
            <PicklistField id="clusterId"
              label="Cluster"
              onChange={this.handleClusterChange}
              options={clusterOptions}
            />
            <PicklistField id="namespace"
              label="Namespace"
              options={namespaceOptions}
            />
            <CodeMirror
              id="podYaml"
              label="Pod YAML"
              options={codeMirrorOptions}
            />
            <SubmitButton>Create Pod</SubmitButton>
          </ValidatedForm>
        }
      </DataLoader>
    )
  }
}

export const options = {
  FormComponent: AddPodForm,
  createFn: createPod,
  loaderFn: loadPods,
  listUrl: '/ui/kubernetes/pods',
  name: 'AddPod',
  title: 'Create Pod',
}

const { AddPage } = createAddComponents(options)

export default AddPage

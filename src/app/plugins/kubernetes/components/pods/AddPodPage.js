import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import { projectAs } from 'utils/fp'
import { loadPods, createPod } from './actions'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { loadNamespaces } from 'k8s/components/namespaces/actions'
import clusterizedDataLoader from 'k8s/helpers/clusterizedDataLoader'

export class AddPodForm extends React.Component {
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

export const options = {
  FormComponent: AddPodForm,
  createFn: createPod,
  loaderFn: loadPods,
  listUrl: '/ui/kubernetes/pods',
  name: 'AddPod',
  title: 'Create Pod',
}

const { AddPage } = createAddComponents(options)

export default clusterizedDataLoader('namespaces', loadNamespaces)(AddPage)

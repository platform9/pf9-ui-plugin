import React from 'react'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import PicklistField from 'core/common/validated_form/PicklistField'
import SubmitButton from 'core/common/SubmitButton'
import TextField from 'core/common/validated_form/TextField'
import createAddComponents from 'core/helpers/createAddComponents'
import { loadInfrastructure } from '../infrastructure/actions'
import { loadPods, createPod } from './actions'
import CodeMirror from 'core/common/validated_form/CodeMirror'

export class AddPodForm extends React.Component {
  state = {
    clusterId: null,
    clusterOptions: [],
    namespaceOptions: [],
  }

  async componentDidMount () {
    const { context, setContext } = this.props
    await loadInfrastructure({ context, setContext })
    // Make sure to use the new reference to context.  It changes after loadInfrastucture.
    const clusterOptions = this.props.context.clusters.map(c => ({ value: c.uuid, label: c.name }))
    this.setState({ clusterOptions })
  }

  setField = key => value => {
    this.setState({ [key]: value })

    if (key === 'clusterId') {
      const { context } = this.props
      const namespaceOptions = context.namespaces.filter(n => n.clusterId === value).map(n => ({ value: n.name, label: n.name }))
      this.setState({ namespaceOptions })
    }
  }

  render () {
    const { clusterOptions, namespaceOptions } = this.state
    if (!clusterOptions) { return null }
    const { onComplete } = this.props
    const codeMirrorOptions = {
      lineNumbers: true,
      mode: 'yaml',
      theme: 'default',
      extraKeys: {
        Tab: (cm) => {
          const spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
          cm.replaceSelection(spaces)
        }
      }
    }

    return (
      <ValidatedForm onSubmit={onComplete}>
        <TextField id="name" label="Name" />
        <PicklistField id="clusterId"
          label="Cluster"
          onChange={this.setField('clusterId')}
          options={clusterOptions}
        />
        <PicklistField id="namespace"
          label="Namespace"
          onChange={this.setField('namespace')}
          options={namespaceOptions}
        />
        <CodeMirror
          id="podYaml"
          label="Pod YAML"
          options={codeMirrorOptions}
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

export default AddPage

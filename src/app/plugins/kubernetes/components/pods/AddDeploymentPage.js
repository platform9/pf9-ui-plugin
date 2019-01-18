import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import { projectAs } from 'utils/fp'
import { loadInfrastructure } from '../infrastructure/actions'
import { loadDeployments, createDeployment } from './actions'
import { withDataLoader } from 'core/DataLoader'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { compose } from 'ramda'

export class AddDeploymentForm extends React.Component {
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
          id="deploymentYaml"
          label="Deployment YAML"
          options={codeMirrorOptions}
        />
        <SubmitButton>Create Deployment</SubmitButton>
      </ValidatedForm>
    )
  }
}

export const options = {
  FormComponent: AddDeploymentForm,
  createFn: createDeployment,
  loaderFn: loadDeployments,
  listUrl: '/ui/kubernetes/pods#deployments',
  name: 'AddDeployment',
  title: 'Create Deployment'
}

const { AddPage } = createAddComponents(options)

export default compose(
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure }),
)(AddPage)

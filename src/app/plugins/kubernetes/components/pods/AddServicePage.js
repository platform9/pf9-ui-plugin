import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import { projectAs } from 'utils/fp'
import { loadServices, createService } from './actions'
import { withDataLoader } from 'core/DataLoader'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { compose } from 'ramda'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import { loadNamespaces } from 'k8s/components/namespaces/actions'

export class AddServiceForm extends React.Component {
  state = {
    clusterOptions: [],
    namespaceOptions: [],
  }

  handleClusterChange = value => {
    const { data } = this.props
    const namespaceOptions = data.namespaces.filter(n => n.clusterId === value).map(n => ({ value: n.name, label: n.name }))
    this.setState({ namespaceOptions })
  }

  render () {
    const { namespaceOptions } = this.state
    const { data, onComplete } = this.props

    const codeMirrorOptions = {
      mode: 'yaml',
    }

    const clusterOptions = data.clusters ? projectAs({ value: 'uuid', label: 'name' }, data.clusters) : []

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
          id="serviceYaml"
          label="Service YAML"
          options={codeMirrorOptions}
        />
        <SubmitButton>Create Service</SubmitButton>
      </ValidatedForm>
    )
  }
}

export const options = {
  FormComponent: AddServiceForm,
  createFn: createService,
  loaderFn: loadServices,
  listUrl: '/ui/kubernetes/pods#services',
  name: 'AddService',
  title: 'Create Service'
}

const { AddPage } = createAddComponents(options)

export default compose(
  withDataLoader({ clusters: loadClusters, namespaces: loadNamespaces }),
)(AddPage)

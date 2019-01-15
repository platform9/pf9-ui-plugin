import React from 'react'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import PicklistField from 'core/common/validated_form/PicklistField'
import SubmitButton from 'core/common/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import { loadInfrastructure } from '../infrastructure/actions'
import { loadPods, createPod } from './actions'
import DataLoader from 'core/DataLoader'
import CodeMirror from 'core/common/validated_form/CodeMirror'

export class AddPodForm extends React.Component {
  state = {
    clusterOptions: [],
    namespaceOptions: [],
  }

  // async componentDidMount () {
  //   // const { context, setContext } = this.props
  //   // await loadInfrastructure({ context, setContext })
  //   // Make sure to use the new reference to context.  It changes after loadInfrastucture.
  //   // const clusterOptions = this.props.context.clusters.map(c => ({ value: c.uuid, label: c.name }))
  //   // this.setState({ clusterOptions })
  // }

  populateNamespaces = value => {
    const { context } = this.props
    const namespaceOptions = context.namespaces.filter(n => n.clusterId === value).map(n => ({ value: n.name, label: n.name }))
    this.setState({ namespaceOptions })
  }

  render () {
    const { namespaceOptions } = this.state
    // if (!clusterOptions) { return null }
    const { onComplete } = this.props

    const codeMirrorOptions = {
      mode: 'yaml',
    }

    const clusterOptions = () => {
      return context.clusters.map(c => ({ value: c.uuid, label: c.name }))
    }

    return (
      <DataLoader dataKey="clusters" loaderFn={loadInfrastructure}>
        {({ data }) =>
          <ValidatedForm onSubmit={onComplete}>
            <PicklistField id="clusterId"
              label="Cluster"
              onChange={this.populateNamespaces}
              options={clusterOptions()}
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

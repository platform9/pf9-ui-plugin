import React from 'react'
import ValidatedForm from 'core/common/ValidatedForm'
import PicklistField from 'core/common/PicklistField'
import SubmitButton from 'core/common/SubmitButton'
import TextField from 'core/common/TextField'
import createAddComponents from 'core/createAddComponents'
import { loadInfrastructure } from '../infrastructure/actions'
import { createNamespace } from './actions'

export class AddNamespaceForm extends React.Component {
  state = {
    clusterId: null,
    clustersOptions: null
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
  }

  render () {
    const { clusterOptions } = this.state
    if (!clusterOptions) { return null }
    const { onComplete } = this.props
    return (
      <ValidatedForm onSubmit={onComplete}>
        <TextField id="name" label="Name" />
        <PicklistField id="clusterId"
          label="cluster"
          onChange={this.setField('clusterId')}
          options={clusterOptions}
        />
        <SubmitButton>Add Namespace</SubmitButton>
      </ValidatedForm>
    )
  }
}

export const options = {
  FormComponent: AddNamespaceForm,
  createFn: createNamespace,
  loaderFn: loadInfrastructure,
  listUrl: '/ui/kubernetes/namespaces',
  name: 'AddNamespace',
  title: 'Add Namespace',
}

const { AddPage } = createAddComponents(options)

export default AddPage

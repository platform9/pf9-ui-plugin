import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import TextField from 'core/components/validatedForm/TextField'
import createAddComponents from 'core/helpers/createAddComponents'
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

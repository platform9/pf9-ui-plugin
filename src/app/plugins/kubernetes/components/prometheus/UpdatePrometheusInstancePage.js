import React from 'react'
import SubmitButton from 'core/components/SubmitButton'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import DataKeys from 'k8s/DataKeys'

class UpdatePrometheusInstanceForm extends React.PureComponent {
  handleUpdate = (data) => {
    this.props.onComplete(data)
  }

  render() {
    return (
      <ValidatedForm initialValues={this.props.initialValues} onSubmit={this.handleUpdate}>
        <TextField
          id="replicas"
          label="# of instances"
          info="Number of Prometheus instances"
          type="number"
        />
        <TextField id="cpu" label="CPU" info="Expressed in millicores (1m = 1/1000th of a core)" />
        <TextField id="memory" label="Memory" info="MiB of memory to allocate" />
        <TextField
          id="retention"
          label="Storage Retention (days)"
          info="Defaults to 15 days if nothing is set"
        />
        <SubmitButton>Update Prometheus Instance</SubmitButton>
      </ValidatedForm>
    )
  }
}

export const options = {
  FormComponent: UpdatePrometheusInstanceForm,
  routeParamKey: 'id',
  uniqueIdentifier: 'uid',
  cacheKey: DataKeys.PrometheusInstances,
  listUrl: '/ui/kubernetes/prometheus#instances',
  name: 'UpdatePrometheusInstance',
  title: 'Update Prometheus Instance',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage

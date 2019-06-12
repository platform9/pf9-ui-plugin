import React from 'react'
import SubmitButton from 'core/components/SubmitButton'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import { loadPrometheusAlertManagers, updatePrometheusAlertManager } from './actions'

class UpdatePrometheusAlertManagerForm extends React.Component {
  handleUpdate = data => {
    this.props.onComplete(data)
  }

  render () {
    return (
      <ValidatedForm initialValues={this.props.initialValues} onSubmit={this.handleUpdate}>
        <TextField id="replicas" label="# of instances" info="Number of Alert Manager instances" type="number" />
        <SubmitButton>Update Alert Manager</SubmitButton>
      </ValidatedForm>
    )
  }
}

export const options = {
  FormComponent: UpdatePrometheusAlertManagerForm,
  routeParamKey: 'id',
  uniqueIdentifier: 'uid',
  updateFn: updatePrometheusAlertManager,
  loaderFn: loadPrometheusAlertManagers,
  listUrl: '/ui/kubernetes/prometheus#alerts',
  name: 'UpdatePrometheusAlertManager',
  title: 'Update Prometheus Alert Manager',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage

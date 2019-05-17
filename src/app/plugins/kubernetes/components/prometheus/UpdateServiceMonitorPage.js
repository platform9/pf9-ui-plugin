import React from 'react'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import { loadPrometheusServiceMonitors, updatePrometheusServiceMonitor } from './actions'
import { objToKeyValueArr } from 'utils/fp'
import { withStyles } from '@material-ui/styles'

@withStyles(theme => ({
  submit: { marginTop: theme.spacing.unit * 3 },
}))
class UpdateServiceMonitorForm extends React.Component {
  state = this.props.initialValues

  handleUpdate = newState => {
    this.props.onComplete(newState)
  }

  render () {
    const initialValues = {...this.props.initialValues}
    initialValues.labels = objToKeyValueArr(initialValues.labels)
    return (
      <ValidatedForm initialValues={initialValues} onSubmit={this.handleUpdate} debug>
        <KeyValuesField id="labels" label="App Labels" info="Key/value pairs for app that Prometheus will monitor" />
        <SubmitButton>Update service monitor</SubmitButton>
      </ValidatedForm>
    )
  }
}

export const options = {
  FormComponent: UpdateServiceMonitorForm,
  routeParamKey: 'id',
  uniqueIdentifier: 'uid',
  updateFn: updatePrometheusServiceMonitor,
  loaderFn: loadPrometheusServiceMonitors,
  listUrl: '/ui/kubernetes/prometheus#serviceMonitors',
  name: 'UpdatePrometheusServiceMonitor',
  title: 'Update Prometheus Service Monitor',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage

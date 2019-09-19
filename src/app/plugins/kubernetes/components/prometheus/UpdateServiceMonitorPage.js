import React from 'react'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import { prometheusServiceMonitorsCacheKey } from './actions'
import { keyValueArrToObj, objToKeyValueArr } from 'utils/fp'

class UpdateServiceMonitorForm extends React.PureComponent {
  handleUpdate = data => {
    const newData = { ...data, labels: keyValueArrToObj(data.labels) }
    this.props.onComplete(newData)
  }

  render () {
    const initialValues = { ...this.props.initialValues }
    initialValues.labels = objToKeyValueArr(initialValues.labels)
    return (
      <ValidatedForm initialValues={initialValues} onSubmit={this.handleUpdate}>
        <KeyValuesField id="labels" label="App Labels" info="Key/value pairs for app that Prometheus will monitor" />
        <SubmitButton>Update service monitor</SubmitButton>
      </ValidatedForm>
    )
  }
}

export const options = {
  FormComponent: UpdateServiceMonitorForm,
  cacheKey: prometheusServiceMonitorsCacheKey,
  routeParamKey: 'id',
  uniqueIdentifier: 'uid',
  listUrl: '/ui/kubernetes/prometheus#serviceMonitors',
  name: 'UpdatePrometheusServiceMonitor',
  title: 'Update Prometheus Service Monitor',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage

import createUpdateComponents from 'core/helpers/createUpdateComponents'
import LoggingForm from './LoggingForm'
import ApiClient from 'api-client/ApiClient'

const { qbert } = ApiClient.getInstance()

// TODO: updateFn
const options = {
  FormComponent: LoggingForm,
  updateFn: () => {},
  loaderFn: qbert.getLoggings,
  listUrl: '/ui/kubernetes/logging',
  name: 'EditLogging',
  title: 'Edit Logging Configuration',
  uniqueIdentifier: 'cluster',
}

const { UpdatePage: LoggingEditPage } = createUpdateComponents(options)

export default LoggingEditPage

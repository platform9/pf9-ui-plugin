import createAddComponents from 'core/helpers/createAddComponents'
import LoggingForm from './LoggingForm'

const options = {
  createFn: () => {},
  FormComponent: LoggingForm,
  listUrl: '/ui/kubernetes/logging',
  name: 'AddLogging',
  title: 'Add New Logging Configuration',
}

const { AddPage: LoggingAddPage } = createAddComponents(options)

export default LoggingAddPage

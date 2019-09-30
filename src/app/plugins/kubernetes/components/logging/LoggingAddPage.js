import createAddComponents from 'core/helpers/createAddComponents'
import LoggingForm from './LoggingForm'

// TODO: createFn
const options = {
  createFn: () => {},
  FormComponent: LoggingForm,
  listUrl: '/ui/kubernetes/logging',
  name: 'AddLogging',
  title: 'Add New Logging Configuration',
}

const { AddPage: LoggingAddPage } = createAddComponents(options)

export default LoggingAddPage

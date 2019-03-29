import React from 'react'
import Checkbox from 'core/components/validatedForm/Checkbox'
import FormWrapper from 'core/components/FormWrapper'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/Wizard'
import WizardStep from 'core/components/WizardStep'
import { compose } from 'ramda'
import { loadInfrastructure } from '../infrastructure/actions'
import { projectAs } from 'utils/fp'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'

const initialContext = {
  numInstances: 1,
  memory: 8,
  cpu: 1,
  storage: 8,
  retention: 15,
}

class AddPrometheusInstancePage extends React.Component {
  handleSubmit = () => console.log('TODO: AddPrometheusInstancePage#handleSubmit')

  render () {
    const clusters = this.props.data
    const clusterOptions = projectAs({ value: 'uuid', label: 'name' }, clusters)
    return (
      <FormWrapper title="Add Prometheus Instance">
        <Wizard onComplete={this.handleSubmit} context={initialContext}>
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <React.Fragment>
                <WizardStep stepId="instance" label="Prometheus Instsance">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <TextField id="name" label="Name" info="Name of the Prometheus instance" />
                    <TextField id="numInstances" label="# of instances" info="Number of Prometheus instances" type="number" />
                    <TextField id="memory" label="Memory" info="GiB of memory to allocate" type="number" />
                    <TextField id="cpu" label="CPU" info="# of CPUs to allocate" type="number" />
                    <PicklistField id="cluster" options={clusterOptions} label="Cluster" info="Clusters available with RoleBing from admin delegation" />
                    <TextField id="storage" label="Storage" info="The storage allocation.  Default is 8 GiB" type="number" />
                    <Checkbox id="enablePersistentStorage" label="Enable persistent storage" />
                    <TextField id="retention" label="Storage Retention (days)" info="Defaults to 15 days if nothing is set" type="number" />
                    <KeyValuesField id="serviceMonitor" label="Service Monitor" info="Key/value pairs for service monitor that Prometheus will use" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="config" label="Configure Alerting">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <h1>TODO: alerting</h1>
                  </ValidatedForm>
                </WizardStep>
              </React.Fragment>
            )
          }}
        </Wizard>
      </FormWrapper>
    )
  }
}

export default compose(
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure }),
  withAppContext,
)(AddPrometheusInstancePage)

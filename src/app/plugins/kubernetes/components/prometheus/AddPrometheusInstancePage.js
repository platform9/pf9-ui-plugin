import React from 'react'
import Checkbox from 'core/components/validatedForm/Checkbox'
import FormWrapper from 'core/components/FormWrapper'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import PrometheusRuleForm from './PrometheusRuleForm'
import PrometheusRulesTable from './PrometheusRulesTable'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/Wizard'
import WizardStep from 'core/components/WizardStep'
import uuid from 'uuid'
import { compose } from 'ramda'
import { createPrometheusInstance } from './actions'
import { loadInfrastructure } from '../infrastructure/actions'
import { projectAs } from 'utils/fp'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'

const initialContext = {
  numInstances: 1,
  memory: 512,
  cpu: 500,
  storage: 8,
  retention: 15,
}

class AddPrometheusInstancePage extends React.Component {
  state = {
    rules: [],
  }

  handleSubmit = data => {
    const { context, setContext } = this.props
    createPrometheusInstance({ data, context, setContext })
  }

  handleAddRule = rule => {
    console.log('handleAddRule', rule)
    const withId = { id: uuid.v4(), ...rule }
    this.setState({ rules: [...this.state.rules, withId] })
  }

  handleDeleteRule = id => () => {
    this.setState(state => ({ rules: state.rules.filter(rule => rule.id !== id) }))
  }

  render () {
    const { rules } = this.state
    const clusters = this.props.data
    const clusterOptions = projectAs({ value: 'uuid', label: 'name' }, clusters)
    const enableStorage = false // We are just using ephemeral storage for the first version
    return (
      <FormWrapper title="Add Prometheus Instance">
        <Wizard onComplete={this.handleSubmit} context={initialContext}>
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <React.Fragment>
                <WizardStep stepId="instance" label="Prometheus Instsance">
                  {rules.length > 0 && <PrometheusRulesTable rules={this.state.rules} onDelete={this.handleDeleteRule} />}
                  <PrometheusRuleForm onSubmit={this.handleAddRule} onDelete={this.handleDeleteRule} />
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <TextField id="name" label="Name" info="Name of the Prometheus instance" />
                    <TextField id="numInstances" label="# of instances" info="Number of Prometheus instances" type="number" />
                    <TextField id="cpu" label="CPU" info="Expressed in millicores (1m = 1/1000th of a core)" type="number" />
                    <TextField id="memory" label="Memory" info="MiB of memory to allocate" type="number" />
                    <TextField id="storage" label="Storage" info="The storage allocation.  Default is 8 GiB" type="number" />
                    <PicklistField id="cluster" options={clusterOptions} label="Cluster" info="Clusters available with RoleBing from admin delegation" />
                    {enableStorage && <Checkbox id="enablePersistentStorage" label="Enable persistent storage" />}
                    <TextField id="retention" label="Storage Retention (days)" info="Defaults to 15 days if nothing is set" type="number" />
                    <KeyValuesField id="serviceMonitor" label="Service Monitor" info="Key/value pairs for service monitor that Prometheus will use" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="config" label="Configure Alerting">
                  <PrometheusRuleForm onSubmit={this.handleAddRule} onDelete={this.handleDeleteRule} />
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

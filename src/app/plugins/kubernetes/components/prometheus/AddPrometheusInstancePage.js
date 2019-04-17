import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
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
import { compose, propEq } from 'ramda'
import { loadServiceAccounts, createPrometheusInstance } from './actions'
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
  port: 'prometheus',
}

class AddPrometheusInstancePage extends React.Component {
  state = {
    clusterUuid: null,
    namespace: null,
    rules: [],
    serviceAccounts: [],
  }

  handleSubmit = data => {
    const { context, setContext } = this.props
    data.rules = this.state.rules
    createPrometheusInstance({ data, context, setContext })
  }

  handleAddRule = rule => {
    const withId = { id: uuid.v4(), ...rule }
    this.setState({ rules: [...this.state.rules, withId] })
  }

  handleClusterChange = async clusterUuid => this.setState({ clusterUuid })

  handleNamespaceChange = async namespace => {
    const serviceAccounts = await loadServiceAccounts(this.state.clusterUuid, namespace)
    this.setState({ serviceAccounts, namespace })
  }

  handleDeleteRule = id => () => {
    this.setState(state => ({ rules: state.rules.filter(rule => rule.id !== id) }))
  }

  render () {
    const { clusterUuid, rules } = this.state
    const { clusters, namespaces } = this.props.context
    const clusterOptions = projectAs({ value: 'uuid', label: 'name' }, clusters)
    const namespaceOptions = clusterUuid
      ? namespaces.filter(propEq('clusterId', clusterUuid)).map(x => x.metadata.name)
      : []
    const serviceAccountOptions = [] // TODO: TBD
    const enableStorage = false // We are just using ephemeral storage for the first version
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
                    <TextField id="cpu" label="CPU" info="Expressed in millicores (1m = 1/1000th of a core)" type="number" />
                    <TextField id="memory" label="Memory" info="MiB of memory to allocate" type="number" />
                    {enableStorage && <TextField id="storage" label="Storage" info="The storage allocation.  Default is 8 GiB" type="number" />}

                    <PicklistField
                      id="cluster"
                      options={clusterOptions}
                      onChange={this.handleClusterChange}
                      label="Cluster"
                      info="Clusters available with RoleBinding from admin delegation"
                    />

                    {namespaceOptions.length > 0 &&
                      <PicklistField
                        id="namespace"
                        onChange={this.handleNamespaceChange}
                        options={namespaceOptions}
                        label="Namespace"
                        info="Which namespace to use"
                      />}

                    {serviceAccountOptions.length > 0 &&
                      <PicklistField
                        id="serviceAccount"
                        options={serviceAccountOptions}
                        label="Service Account"
                        info="Which service account to use"
                      />}

                    {enableStorage && <CheckboxField id="enablePersistentStorage" label="Enable persistent storage" />}
                    <TextField id="retention" label="Storage Retention (days)" info="Defaults to 15 days if nothing is set" type="number" />
                    <TextField id="port" label="Service Monitor Port" info="Port for the service monitor" />
                    <KeyValuesField id="appLabels" label="App Labels" info="Key/value pairs for app that Prometheus will monitor" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="config" label="Configure Alerting">
                  {rules.length > 0 && <PrometheusRulesTable rules={this.state.rules} onDelete={this.handleDeleteRule} />}
                  <PrometheusRuleForm onSubmit={this.handleAddRule} />
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

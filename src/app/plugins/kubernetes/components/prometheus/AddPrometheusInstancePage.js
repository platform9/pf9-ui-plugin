import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import PrometheusRuleForm from './PrometheusRuleForm'
import PrometheusRulesTable from './PrometheusRulesTable'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/Wizard'
import WizardStep from 'core/components/WizardStep'
import createAddComponents from 'core/helpers/createAddComponents'
import uuid from 'uuid'
import { compose, propEq } from 'ramda'
import { projectAs } from 'utils/fp'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import { loadNamespaces } from 'k8s/components/namespaces/actions'
import {
  createPrometheusInstance,
  loadPrometheusResources,
  loadServiceAccounts,
} from './actions'

const initialContext = {
  numInstances: 1,
  memory: 512,
  cpu: 500,
  storage: 8,
  retention: 15,
  port: 'prometheus',
}

class AddPrometheusInstanceFormBase extends React.Component {
  state = {
    clusterUuid: null,
    namespace: null,
    rules: [],
    serviceAccounts: [],
  }

  handleSubmit = async data => {
    const { onComplete } = this.props
    const { rules } = this.state
    data.rules = rules
    onComplete(data)
  }

  handleAddRule = rule => {
    const withId = { id: uuid.v4(), ...rule }
    this.setState({ rules: [...this.state.rules, withId] })
  }

  handleClusterChange = async clusterUuid => this.setState({ clusterUuid })

  handleNamespaceChange = async namespace => {
    const { context, setContext } = this.props
    const data = { clusterUuid: this.state.clusterUuid, namespace }
    const serviceAccounts = await loadServiceAccounts({ data, context, setContext })
    this.setState({ serviceAccounts, namespace })
  }

  handleDeleteRule = id => () => {
    this.setState(state => ({ rules: state.rules.filter(rule => rule.id !== id) }))
  }

  render () {
    const { clusterUuid, namespace, rules, serviceAccounts } = this.state
    const { clusters, namespaces } = this.props.context
    const clusterOptions = projectAs({ value: 'uuid', label: 'name' }, clusters)
    const namespaceOptions = clusterUuid
      ? namespaces.filter(propEq('clusterId', clusterUuid)).map(x => x.metadata.name)
      : []
    const serviceAccountOptions = namespace
      ? serviceAccounts.map(x => x.metadata.name)
      : []
    const enableStorage = false // We are just using ephemeral storage for the first version
    return (
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
                  {enableStorage &&
                  <TextField id="storage" label="Storage" info="The storage allocation.  Default is 8 GiB" type="number" />}

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
                    id="serviceAccountName"
                    options={serviceAccountOptions}
                    label="Service Account Name"
                    info="Prometheus will use this to query metrics endpoints"
                  />}

                  {enableStorage &&
                  <CheckboxField id="enablePersistentStorage" label="Enable persistent storage" />}
                  <TextField id="retention" label="Storage Retention (days)" info="Defaults to 15 days if nothing is set" type="number" />
                  <TextField id="port" label="Service Monitor Port" info="Port for the service monitor" />
                  <KeyValuesField id="appLabels" label="App Labels" info="Key/value pairs for app that Prometheus will monitor" />
                </ValidatedForm>
              </WizardStep>
              <WizardStep stepId="config" label="Configure Alerting">
                {rules.length > 0 &&
                <PrometheusRulesTable rules={this.state.rules} onDelete={this.handleDeleteRule} />}
                <PrometheusRuleForm onSubmit={this.handleAddRule} />
              </WizardStep>
            </React.Fragment>
          )
        }}
      </Wizard>
    )
  }
}

const AddPrometheusInstanceForm = compose(
  withDataLoader({
    clusters: loadClusters,
    namespaces: loadNamespaces,
  }),
  withAppContext,
)(AddPrometheusInstanceFormBase)

export const options = {
  FormComponent: AddPrometheusInstanceForm,
  createFn: createPrometheusInstance,
  loaderFn: loadPrometheusResources,
  listUrl: '/ui/kubernetes/prometheus#instances',
  name: 'AddPrometheusInstance',
  title: 'Add Prometheus Instance',
}

const { AddPage } = createAddComponents(options)

export default AddPage

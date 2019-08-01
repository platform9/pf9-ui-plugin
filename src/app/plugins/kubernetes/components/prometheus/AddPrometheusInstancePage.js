import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import PrometheusRuleForm from './PrometheusRuleForm'
import PrometheusRulesTable from './PrometheusRulesTable'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import createAddComponents from 'core/helpers/createAddComponents'
import uuid from 'uuid'
import { compose, path, pluck } from 'ramda'
import { projectAs } from 'utils/fp'
import { loadNamespaces } from 'k8s/components/namespaces/actions'
import { createPrometheusInstance, loadPrometheusInstances, loadServiceAccounts } from './actions'
import { castFuzzyBool } from 'utils/misc'
import clusterizedDataLoader from 'k8s/helpers/clusterizedDataLoader'

const initialContext = {
  replicas: 1,
  memory: '512Mi',
  cpu: '500m',
  storage: '8Gi',
  retention: '15d',
  port: 'prometheus',
  appLabels: [],
}

const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))

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

  handleClusterChange = async clusterUuid => {
    this.setState({ clusterUuid })
    this.props.setParams({ clusterId: clusterUuid })
  }

  handleNamespaceChange = async namespace => {
    const { getContext, setContext } = this.props
    const data = { clusterUuid: this.state.clusterUuid, namespace }
    const serviceAccounts = await loadServiceAccounts({ data, getContext, setContext })

    this.setState({ serviceAccounts, namespace })
  }

  handleDeleteRule = id => () => {
    this.setState(state => ({ rules: state.rules.filter(rule => rule.id !== id) }))
  }

  render () {
    const { namespace, rules, serviceAccounts } = this.state
    const { clusters, namespaces } = this.props.data
    const clustersWithPrometheus = clusters.filter(hasPrometheusEnabled)
    const clusterOptions = projectAs({ value: 'uuid', label: 'name' }, clustersWithPrometheus)
    const namespaceOptions = pluck('name', namespaces)
    const serviceAccountOptions = namespace
      ? serviceAccounts.map(x => x.metadata.name)
      : []
    const enableStorage = false // We are just using ephemeral storage for the first version
    return (
      <Wizard onComplete={this.handleSubmit} context={initialContext}>
        {({ wizardContext, setWizardContext, onNext }) => {
          return (
            <React.Fragment>
              <WizardStep stepId="instance" label="Prometheus Instance">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  <TextField id="name" label="Name" info="Name of the Prometheus instance" />
                  <TextField id="replicas" label="Replicas" info="Number of Prometheus replicas" type="number" />
                  <TextField id="cpu" label="CPU" info="Expressed in millicores (1m = 1/1000th of a core)" />
                  <TextField id="memory" label="Memory" info="MiB of memory to allocate" />
                  {enableStorage &&
                  <TextField id="storage" label="Storage" info="The storage allocation.  Default is 8 GiB" />}

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
                  <TextField id="retention" label="Storage Retention (days)" info="Defaults to 15 days if nothing is set" />
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

const AddPrometheusInstanceForm = clusterizedDataLoader('namespaces', loadNamespaces)(AddPrometheusInstanceFormBase)

export const options = {
  FormComponent: AddPrometheusInstanceForm,
  createFn: createPrometheusInstance,
  loaderFn: loadPrometheusInstances,
  listUrl: '/ui/kubernetes/prometheus#instances',
  name: 'AddPrometheusInstance',
  title: 'Add Prometheus Instance',
}

const { AddPage } = createAddComponents(options)

export default AddPage

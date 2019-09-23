import React, { useCallback, useState } from 'react'
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
import { removeWith, emptyArr } from 'utils/fp'
import { prometheusInstancesCacheKey } from './actions'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import ServiceAccountPicklist from 'k8s/components/prometheus/ServiceAccountPicklist'
import useParams from 'core/hooks/useParams'

const initialContext = {
  replicas: 1,
  memory: '512Mi',
  cpu: '500m',
  storage: '8Gi',
  retention: '15d',
  port: 'prometheus',
  appLabels: [],
}
const defaultParams = {
  prometheusClusters: true,
}

const AddPrometheusInstanceForm = ({ onComplete }) => {
  const enableStorage = false // We are just using ephemeral storage for the first version
  const { params, getParamsUpdater } = useParams(defaultParams)
  const [rules, setRules] = useState(emptyArr)
  const handleAddRule = useCallback(
    rule => {
      const withId = { id: uuid.v4(), ...rule }
      setRules([...rules, withId])
    }, [rules])
  const handleDeleteRule = useCallback(
    id => setRules(removeWith(rule => rule.id === id, rules)),
    [rules])
  const handleSubmit = useCallback(
    data => onComplete({ ...data, rules }),
    [rules])

  return (
    <Wizard onComplete={handleSubmit} context={initialContext}>
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
                  DropdownComponent={ClusterPicklist}
                  id="cluster"
                  label="Cluster"
                  onChange={getParamsUpdater('clusterId')}
                  value={params.clusterId}
                  showAll={false}
                  onlyPrometheusEnabled
                  required
                  info="Clusters available with RoleBinding from admin delegation"
                />
                <PicklistField
                  DropdownComponent={NamespacePicklist}
                  id="namespace"
                  label="Namespace"
                  disabled={!params.clusterId}
                  clusterId={params.clusterId}
                  onChange={getParamsUpdater('namespace')}
                  value={params.namespace}
                  required
                  selectFirst={false}
                  info="Which namespace to use"
                />
                <PicklistField
                  DropdownComponent={ServiceAccountPicklist}
                  id="serviceAccountName"
                  label="Service Account Name"
                  disabled={!params.clusterId || !params.namespace}
                  clusterId={params.clusterId}
                  namespace={params.namespace}
                  onChange={getParamsUpdater('serviceId')}
                  value={params.serviceId}
                  info="Prometheus will use this to query metrics endpoints"
                />
                {enableStorage &&
                <CheckboxField id="enablePersistentStorage" label="Enable persistent storage" />}
                <TextField id="retention" label="Storage Retention (days)" info="Defaults to 15 days if nothing is set" />
                <TextField id="port" label="Service Monitor Port" info="Port for the service monitor" />
                <KeyValuesField id="appLabels" label="App Labels" info="Key/value pairs for app that Prometheus will monitor" />
              </ValidatedForm>
            </WizardStep>
            <WizardStep stepId="config" label="Configure Alerting">
              {rules.length > 0 &&
              <PrometheusRulesTable rules={rules} onDelete={handleDeleteRule} />}
              <PrometheusRuleForm onSubmit={handleAddRule} />
            </WizardStep>
          </React.Fragment>
        )
      }}
    </Wizard>
  )
}

export const options = {
  cacheKey: prometheusInstancesCacheKey,
  FormComponent: AddPrometheusInstanceForm,
  listUrl: '/ui/kubernetes/prometheus#instances',
  name: 'AddPrometheusInstance',
  title: 'Add Prometheus Instance',
}

const { AddPage } = createAddComponents(options)

export default AddPage

import React, { useCallback } from 'react'
import jsYaml from 'js-yaml'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { codeMirrorOptions, k8sPrefix } from 'app/constants'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import useParams from 'core/hooks/useParams'
import { Typography } from '@material-ui/core'
import ExternalLink from 'core/components/ExternalLink'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import { objSwitchCase } from 'utils/fp'
import moize from 'moize'
import { deploymentActions, serviceActions, podActions } from 'k8s/components/pods/actions'
import Progress from 'core/components/progress/Progress'
import Button from '@material-ui/core/Button'
import { requiredValidator, customValidator } from 'core/utils/fieldValidators'

const createPodUrl =
  'https://kubernetes.io/docs/tasks/configure-pod-container/communicate-containers-same-pod/#creating-a-pod-that-runs-two-containers'
const createDeploymentUrl =
  'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#creating-a-deployment'
const createServiceUrl =
  'https://kubernetes.io/docs/tutorials/connecting-apps/connecting-frontend-backend/#creating-the-backend-service-object'

const helpText = <Typography variant="body1" component="div">
  <p>
    To deploy a new resource, select the appropriate options below and input the resource
    configuration yaml.
  </p>
  <p>
    For more information on creating resources, see the following articles:
  </p>
  <ul>
    <li><ExternalLink url={createPodUrl}>Creating a Pod</ExternalLink></li>
    <li><ExternalLink url={createDeploymentUrl}>Creating a Deployment</ExternalLink></li>
    <li><ExternalLink url={createServiceUrl}>Creating a Service</ExternalLink></li>
  </ul>
</Typography>

const resourceTypes = [
  { value: 'pod', label: 'Pod' },
  { value: 'deployment', label: 'Deployment' },
  { value: 'service', label: 'Service' },
]
const listRoutes = {
  pod: `${k8sPrefix}/pods`,
  deployment: `${k8sPrefix}/pods#deployments`,
  service: `${k8sPrefix}/pods#services`,
}

const yamlTemplates = {
  pod: `apiVersion: v1
kind: pod
metadata:
  name: redis-django
  labels:
    app: web
spec:
  containers:
    - name: key-value-store
      image: redis
      ports:
        - containerPort: 6379
    - name: frontend
      image: django
      ports:
        - containerPort: 8000
`,
  deployment: `apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
        ports:
        - containerPort: 80
`,
  service: `apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  ports:
    - port: 8765
      targetPort: 9376
  selector:
    app: example
`,
}

const moizedYamlLoad = moize(jsYaml.safeLoad, {
  maxSize: 10,
})

const codeMirrorValidations = [
  requiredValidator,
  customValidator(yaml => {
    try {
      moizedYamlLoad(yaml)
      return true
    } catch (err) {
      return false
    }
  },
  'Provided YAML code is invalid'),
  customValidator((yaml, formFields) => {
    try {
      const body = moizedYamlLoad(yaml)
      return body.kind.toLowerCase() === formFields.resourceType.toLowerCase()
    } catch (err) {
      return true
    }
  },
  'Resource type does not match with selected resource type above'),
]

export const AddResourceForm = ({ resourceType = 'pod' }) => {
  const { history } = useReactRouter()
  const { params, getParamsUpdater, updateParams } = useParams({ resourceType })
  const onComplete = useCallback(() =>
    history.push(listRoutes[params.resourceType]), [history])
  const createFn = objSwitchCase({
    pod: podActions.create,
    deployment: deploymentActions.create,
    service: serviceActions.create,
  })(params.resourceType)
  const [handleAdd, adding] = useDataUpdater(createFn, onComplete)
  const insertYamlTemplate = useCallback(() => updateParams({
    yaml: yamlTemplates[params.resourceType],
  }), [params])

  return (
    <FormWrapper title='New Resource' backUrl={listRoutes[resourceType]}>
      {helpText}<br />
      <Progress overlay loading={adding} renderContentOnMount>
        <ValidatedForm onSubmit={handleAdd}>
          <PicklistField
            validateFormOnChange
            id="resourceType"
            label="Resource Type"
            info="Can be a pod, deployment, or service. This must match with the resource YAML specified below"
            onChange={getParamsUpdater('resourceType')}
            initialValue={params.resourceType}
            options={resourceTypes}
            required
          />
          <PicklistField
            DropdownComponent={ClusterPicklist}
            id="clusterId"
            label="Cluster"
            info="The cluster to deploy this resource on"
            onChange={getParamsUpdater('clusterId')}
            required
          />
          <PicklistField
            DropdownComponent={NamespacePicklist}
            disabled={!params.clusterId}
            id="namespace"
            label="Namespace"
            info="The namespace to deploy this resource on"
            clusterId={params.clusterId}
            required
          />
          <CodeMirror
            id="yaml"
            label="Resource YAML"
            validations={codeMirrorValidations}
            onChange={getParamsUpdater('yaml')}
            value={params.yaml}
            info="Manually input the resource YAML. For more information, see the articles linked at the top of this form"
            options={codeMirrorOptions}
          />
          <Button onClick={insertYamlTemplate}>
            Use example {params.resourceType} template
          </Button>
          <SubmitButton>Create Resource</SubmitButton>
        </ValidatedForm>
      </Progress>
    </FormWrapper>
  )
}

export default AddResourceForm

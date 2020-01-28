import React, { useCallback } from 'react'
import jsYaml from 'js-yaml'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import {
  codeMirrorOptions,
  createDeploymentUrl,
  createServiceUrl,
  createPodUrl,
} from 'app/constants'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import useParams from 'core/hooks/useParams'
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
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { makeStyles } from '@material-ui/styles'
import { capitalizeString } from 'utils/misc'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles((theme) => ({
  formWidth: {
    width: 715,
  },
  tableWidth: {
    width: 687, // oddly specific, this is so the tooltip doesn't overlay on the card
    marginBottom: theme.spacing(),
  },
  inputWidth: {
    maxWidth: 350,
  },
  submit: {
    display: 'flex',
    marginLeft: theme.spacing(2),
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
}))

const listRoutes = {
  pod: routes.pods.list,
  deployment: routes.deployments.list,
  service: routes.services.list,
}
const linksByResourceType = {
  pod: { icon: 'cubes', url: createPodUrl, label: 'How do I create a pod?' },
  deployment: { icon: 'window', url: createDeploymentUrl, label: 'How do I create a deployment?' },
  service: { icon: 'tasks-alt', url: createServiceUrl, label: 'How do I create a service?' },
}

const yamlTemplates = {
  pod: `apiVersion: v1
kind: Pod
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
  customValidator((yaml) => {
    try {
      moizedYamlLoad(yaml)
      return true
    } catch (err) {
      return false
    }
  }, 'Provided YAML code is invalid'),
  customValidator((yaml, formFields) => {
    try {
      const body = moizedYamlLoad(yaml)
      return body.kind.toLowerCase() === formFields.resourceType.toLowerCase()
    } catch (err) {
      return true
    }
  }, 'Resource type does not match with selected resource type above'),
]

export const AddResourceForm = ({ resourceType = 'pod' }) => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const { params, getParamsUpdater, updateParams } = useParams({ resourceType })
  const onComplete = useCallback(() => history.push(listRoutes[params.resourceType]), [history])
  const createFn = objSwitchCase({
    pod: podActions.create,
    deployment: deploymentActions.create,
    service: serviceActions.create,
  })(params.resourceType)
  const [handleAdd, adding] = useDataUpdater(createFn, onComplete)
  const insertYamlTemplate = useCallback(
    () =>
      updateParams({
        yaml: yamlTemplates[params.resourceType],
      }),
    [params],
  )

  const { icon, url, label } = linksByResourceType[params.resourceType]
  const formattedResourceName = capitalizeString(params.resourceType)

  return (
    <FormWrapper title="New Resource" backUrl={listRoutes[params.resourceType]}>
      <Progress overlay loading={adding} renderContentOnMount>
        <ValidatedForm onSubmit={handleAdd}>
          <div className={classes.formWidth}>
            <FormFieldCard
              title={`Add a ${formattedResourceName}`}
              link={
                <div>
                  <FontAwesomeIcon className={classes.blueIcon} size="md">
                    {icon}
                  </FontAwesomeIcon>{' '}
                  <ExternalLink url={url}>{label}</ExternalLink>
                </div>
              }
            >
              <div className={classes.inputWidth}>
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
              </div>
              <div className={classes.tableWidth}>
                <CodeMirror
                  id="yaml"
                  label="Resource YAML"
                  validations={codeMirrorValidations}
                  onChange={getParamsUpdater('yaml')}
                  value={params.yaml}
                  info="Manually input the resource YAML. For more information, see the articles linked at the top of this form"
                  options={codeMirrorOptions}
                />
              </div>
              <div className={classes.inputWidth}>
                <Button color="secondary" variant="contained" onClick={insertYamlTemplate}>
                  View {formattedResourceName} Template
                </Button>
              </div>
            </FormFieldCard>
            <div className={classes.submit}>
              <SubmitButton>Create {formattedResourceName}</SubmitButton>
            </div>
          </div>
        </ValidatedForm>
      </Progress>
    </FormWrapper>
  )
}

export default AddResourceForm

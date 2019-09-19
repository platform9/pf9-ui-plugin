import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { codeMirrorOptions } from 'app/constants'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import useParams from 'core/hooks/useParams'

const defaultParams = {
  masterNodeClusters: true,
}
export const AddDeploymentForm = ({ onComplete }) => {
  const { params, getParamsUpdater } = useParams(defaultParams)
  return (
    <ValidatedForm onSubmit={onComplete}>
      <PicklistField
        DropdownComponent={ClusterPicklist}
        id="clusterId"
        label="Cluster"
        onChange={getParamsUpdater('clusterId')}
        value={params.clusterId}
        showAll={false}
        required
      />
      <PicklistField
        DropdownComponent={NamespacePicklist}
        disabled={!params.clusterId}
        id="namespace"
        label="Namespace"
        clusterId={params.clusterId}
        onChange={getParamsUpdater('namespace')}
        value={params.namespace}
        required
      />
      <CodeMirror
        id="deploymentYaml"
        label="Deployment YAML"
        options={codeMirrorOptions}
        required
      />
      <SubmitButton>Create Deployment</SubmitButton>
    </ValidatedForm>
  )
}

export const options = {
  cacheKey: 'deployments',
  FormComponent: AddDeploymentForm,
  listUrl: '/ui/kubernetes/pods#deployments',
  name: 'AddDeployment',
  title: 'Create Deployment',
}

const { AddPage } = createAddComponents(options)

export default AddPage

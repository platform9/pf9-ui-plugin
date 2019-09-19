import React from 'react'
import { codeMirrorOptions } from 'app/constants'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import useParams from 'core/hooks/useParams'

const defaultParams = {
  masterNodeClusters: true,
}
export const AddServiceForm = ({ onComplete }) => {
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
        onChange={getParamsUpdater('namespace')}
        id="namespace"
        label="Namespace"
        clusterId={params.clusterId}
        value={params.namespace}
        required
      />
      <CodeMirror
        id="serviceYaml"
        label="Service YAML"
        options={codeMirrorOptions}
        required
      />
      <SubmitButton>Create Service</SubmitButton>
    </ValidatedForm>
  )
}

export const options = {
  cacheKey: 'kubeServices',
  FormComponent: AddServiceForm,
  listUrl: '/ui/kubernetes/pods#services',
  name: 'AddService',
  title: 'Create Service',
}

const { AddPage } = createAddComponents(options)

export default AddPage

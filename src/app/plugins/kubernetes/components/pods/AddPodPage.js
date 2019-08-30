import React, { useState, useCallback } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { codeMirrorOptions } from 'app/constants'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import { podsDataKey } from './actions'

const defaultParams = {
  masterNodeClusters: true,
}
export const AddPodForm = ({ onComplete }) => {
  const [params, setParams] = useState(defaultParams)
  const handleClusterChange = useCallback(clusterId => {
    setParams({ ...params, clusterId })
  }, [])
  return (
    <ValidatedForm onSubmit={onComplete}>
      <PicklistField
        DropdownComponent={ClusterPicklist}
        id="clusterId"
        label="Cluster"
        onChange={handleClusterChange}
        value={params.clusterId}
        required
      />
      <PicklistField
        DropdownComponent={NamespacePicklist}
        disabled={!params.clusterId}
        id="namespace"
        label="Namespace"
        clusterId={params.clusterId}
        value={params.namespaceId}
        required
      />
      <CodeMirror
        id="podYaml"
        label="Pod YAML"
        options={codeMirrorOptions}
        required
      />
      <SubmitButton>Create Pod</SubmitButton>
    </ValidatedForm>
  )
}

export const options = {
  dataKey: podsDataKey,
  FormComponent: AddPodForm,
  listUrl: '/ui/kubernetes/pods',
  name: 'AddPod',
  title: 'Create Pod',
}

const { AddPage } = createAddComponents(options)

export default AddPage

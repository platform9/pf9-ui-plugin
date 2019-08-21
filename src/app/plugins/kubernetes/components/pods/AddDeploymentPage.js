import React, { useState, useCallback } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import { emptyObj } from 'utils/fp'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { codeMirrorOptions } from 'app/constants'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'

export const AddDeploymentForm = ({ onComplete }) => {
  const [params, setParams] = useState(emptyObj)
  const handleClusterChange = useCallback(clusterId => setParams({ clusterId }), [])
  return (
    <ValidatedForm onSubmit={onComplete}>
      <PicklistField
        DropdownComponent={ClusterPicklist}
        id="clusterId"
        label="Cluster"
        onChange={handleClusterChange}
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
        value={params.namespaceId}
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
  dataKey: 'deployments',
  FormComponent: AddDeploymentForm,
  listUrl: '/ui/kubernetes/pods#deployments',
  name: 'AddDeployment',
  title: 'Create Deployment',
}

const { AddPage } = createAddComponents(options)

export default AddPage

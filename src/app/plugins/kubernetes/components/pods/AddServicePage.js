import React, { useState, useCallback } from 'react'
import { codeMirrorOptions } from 'app/constants'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import { emptyObj } from 'utils/fp'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'

export const AddServiceForm = ({ onComplete }) => {
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
      {params.clusterId && <PicklistField
        DropdownComponent={NamespacePicklist}
        loading={!params.clusterId}
        id="namespace"
        label="Namespace"
        clusterId={params.clusterId}
        value={params.namespaceId}
        required
      />}
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
  dataKey: 'kubeServices',
  FormComponent: AddServiceForm,
  listUrl: '/ui/kubernetes/pods#services',
  name: 'AddService',
  title: 'Create Service',
}

const { AddPage } = createAddComponents(options)

export default AddPage

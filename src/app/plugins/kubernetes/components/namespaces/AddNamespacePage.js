import React, { useState, useCallback } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import { emptyObj } from 'utils/fp'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import TextField from 'core/components/validatedForm/TextField'
import { namespacesDataKey } from './actions'

export const AddNamespaceForm = ({ onComplete }) => {
  const [params, setParams] = useState(emptyObj)
  const handleClusterChange = useCallback(clusterId => setParams({ clusterId }), [])
  return (
    <ValidatedForm onSubmit={onComplete}>
      <TextField id="name" label="Name" required />
      <PicklistField
        DropdownComponent={ClusterPicklist}
        id="clusterId"
        label="Cluster"
        onChange={handleClusterChange}
        value={params.clusterId}
        required
      />
      <SubmitButton>Add Namespace</SubmitButton>
    </ValidatedForm>
  )
}

export const options = {
  dataKey: namespacesDataKey,
  FormComponent: AddNamespaceForm,
  listUrl: '/ui/kubernetes/namespaces',
  name: 'AddNamespace',
  title: 'Add Namespace',
}

const { AddPage } = createAddComponents(options)

export default AddPage

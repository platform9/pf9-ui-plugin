import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import TextField from 'core/components/validatedForm/TextField'
import useParams from 'core/hooks/useParams'
import { namespaceValidator } from 'core/utils/fieldValidators'
import { ActionDataKeys } from 'k8s/DataKeys'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: null,
}

export const AddNamespaceForm = ({ onComplete }) => {
  const { params, getParamsUpdater } = useParams(defaultParams)
  return (
    <ValidatedForm
      onSubmit={onComplete}
      title="Name Your Namespace"
      formActions={<SubmitButton>Add Namespace</SubmitButton>}
    >
      <TextField id="name" label="Name" required validations={[namespaceValidator]} />
      <PicklistField
        DropdownComponent={ClusterPicklist}
        id="clusterId"
        label="Cluster"
        onChange={getParamsUpdater('clusterId')}
        value={params.clusterId}
        required
      />
    </ValidatedForm>
  )
}

export const options = {
  cacheKey: ActionDataKeys.Namespaces, // TODO I think this is namespaces
  FormComponent: AddNamespaceForm,
  listUrl: '/ui/kubernetes/namespaces',
  name: 'AddNamespace',
  title: 'Add Namespace',
}

const { AddPage } = createAddComponents(options)

export default AddPage

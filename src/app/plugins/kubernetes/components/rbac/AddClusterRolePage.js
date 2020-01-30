import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import RbacChecklist from './RbacChecklist'
import TextField from 'core/components/validatedForm/TextField'
import { clusterRolesCacheKey } from './actions'
import useParams from 'core/hooks/useParams'

const defaultParams = {
  rbac: {},
}
export const AddClusterRoleForm = ({ onComplete }) => {
  const { params, getParamsUpdater } = useParams(defaultParams)

  return (
    <ValidatedForm onSubmit={onComplete}>
      <TextField id="name" label="Name" required />
      <PicklistField
        DropdownComponent={ClusterPicklist}
        id="clusterId"
        label="Cluster"
        onChange={getParamsUpdater('clusterId')}
        value={params.clusterId}
        required
      />
      { params.clusterId && <RbacChecklist
        id="rbac"
        clusterId={params.clusterId}
        onChange={getParamsUpdater('rbac')}
        value={params.rbac}
      /> }
      <SubmitButton>Add Cluster Role</SubmitButton>
    </ValidatedForm>
  )
}

export const options = {
  cacheKey: clusterRolesCacheKey,
  FormComponent: AddClusterRoleForm,
  listUrl: '/ui/kubernetes/rbac#clusterRoles',
  name: 'AddClusterRole',
  title: 'Add Cluster Role',
}

const { AddPage } = createAddComponents(options)

export default AddPage

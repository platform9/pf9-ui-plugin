import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import UserMultiSelect from 'k8s/components/common/UserMultiSelect'
import GroupMultiSelect from 'k8s/components/common/GroupMultiSelect'
import RolePicklist from './RolePicklist'
import TextField from 'core/components/validatedForm/TextField'
import { roleBindingActions } from './actions'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'

const defaultParams = {
  users: [],
  groups: []
}
export const AddRoleBindingForm = () => {
  const { params, getParamsUpdater } = useParams(defaultParams)
  const { history } = useReactRouter()
  const onComplete = success => success && history.push('/ui/kubernetes/rbac#roleBindings')
  const [createRoleBindingAction] = useDataUpdater(roleBindingActions.create, onComplete)
  const handleSubmit = params => data => createRoleBindingAction({ ...data, ...params })

  return (
    <FormWrapper
      title="Add Role Binding"
      backUrl='/ui/kubernetes/rbac#roleBindings'
    >
      <ValidatedForm onSubmit={handleSubmit(params)}>
        <TextField id="name" label="Name" required />
        <PicklistField
          DropdownComponent={ClusterPicklist}
          id="clusterId"
          label="Cluster"
          onChange={getParamsUpdater('clusterId')}
          value={params.clusterId}
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
        <PicklistField
          DropdownComponent={RolePicklist}
          disabled={!params.clusterId}
          id="role"
          label="Role"
          clusterId={params.clusterId}
          onChange={getParamsUpdater('role')}
          value={params.role}
          showAllRoleTypes
          required
        />
        <UserMultiSelect
          id="users"
          info="Select users to assign this role"
          onChange={getParamsUpdater('users')}
          required
        />
        <GroupMultiSelect
          id="groups"
          info="Select groups to assign this role"
          onChange={getParamsUpdater('groups')}
          required
        />
        <SubmitButton>Add Role Binding</SubmitButton>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default AddRoleBindingForm

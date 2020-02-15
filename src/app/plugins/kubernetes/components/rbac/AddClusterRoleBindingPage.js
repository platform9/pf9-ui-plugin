import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import UserMultiSelect from 'k8s/components/common/UserMultiSelect'
import RolePicklist from './RolePicklist'
import TextField from 'core/components/validatedForm/TextField'
import { clusterRoleBindingActions } from './actions'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

const defaultParams = {
  users: [],
  groups: [],
}
export const AddClusterRoleBindingForm = () => {
  const { params, getParamsUpdater } = useParams(defaultParams)
  const { history } = useReactRouter()
  const onComplete = (success) => success && history.push('/ui/kubernetes/rbac#clusterRoleBindings')
  const [createClusterRoleBindingAction] = useDataUpdater(
    clusterRoleBindingActions.create,
    onComplete,
  )
  const handleSubmit = (params) => (data) => createClusterRoleBindingAction({ ...data, ...params })

  return (
    <FormWrapper title="Add Cluster Role Binding" backUrl="/ui/kubernetes/rbac#clusterRoleBindings">
      <ValidatedForm
        elevated={false}
        formActions={<SubmitButton>Add Cluster Role Binding</SubmitButton>}
        onSubmit={handleSubmit(params)}
      >
        <FormFieldCard title="Basic Details">
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
            DropdownComponent={RolePicklist}
            disabled={!params.clusterId}
            id="clusterRole"
            label="Cluster Role"
            clusterId={params.clusterId}
            onChange={getParamsUpdater('clusterRole')}
            value={params.clusterRole}
            required
          />
        </FormFieldCard>
        <FormFieldCard title="Assign Users to this Cluster Binding">
          <UserMultiSelect
            id="users"
            info="Select users to assign this role"
            onChange={getParamsUpdater('users')}
          />
        </FormFieldCard>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default AddClusterRoleBindingForm

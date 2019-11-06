import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import UserMultiSelect from 'k8s/components/common/UserMultiSelect'
import GroupMultiSelect from 'k8s/components/common/GroupMultiSelect'
import RolePicklist from './RolePicklist'
import TextField from 'core/components/validatedForm/TextField'
import { clusterRoleBindingsCacheKey, clusterRoleBindingActions } from './actions'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'

const defaultParams = {}
export const AddClusterRoleBindingForm = () => {
  const { params, getParamsUpdater } = useParams(defaultParams)
  const { history } = useReactRouter()
  const onComplete = () => history.push('/ui/kubernetes/rbac#clusterRoleBindings')
  const [createClusterRoleBindingAction] = useDataUpdater(clusterRoleBindingActions.create, onComplete)
  const handleSubmit = params => data => createClusterRoleBindingAction({ ...data, ...params })

  return (
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
        DropdownComponent={RolePicklist}
        disabled={!params.clusterId}
        id="clusterRole"
        label="Cluster Role"
        clusterId={params.clusterId}
        onChange={getParamsUpdater('clusterRole')}
        value={params.clusterRole}
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
      <SubmitButton>Add Cluster Role Binding</SubmitButton>
    </ValidatedForm>
  )
}

export const options = {
  cacheKey: clusterRoleBindingsCacheKey,
  FormComponent: AddClusterRoleBindingForm,
  listUrl: '/ui/kubernetes/rbac#clusterRoleBindings',
  name: 'AddClusterRoleBinding',
  title: 'Add Cluster Role Binding',
}

const { AddPage } = createAddComponents(options)

export default AddPage

import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import React, { useMemo, useCallback, useEffect } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterRoleBindingActions } from 'k8s/components/rbac/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { emptyObj } from 'utils/fp'
import useReactRouter from 'use-react-router'
import { propEq } from 'ramda'
import useParams from 'core/hooks/useParams'
import { allKey } from 'app/constants'
import UserMultiSelect from 'k8s/components/common/UserMultiSelect'
import GroupMultiSelect from 'k8s/components/common/GroupMultiSelect'
import FormWrapper from 'core/components/FormWrapper'
import PresetField from 'core/components/PresetField'

const defaultParams = {
  users: [],
  groups: [],
}

const UpdateClusterRoleBindingPage = () => {
  const { match, history } = useReactRouter()
  const clusterRoleBindingId = match.params.id
  const onComplete = useCallback(
    success => success && history.push('/ui/kubernetes/rbac#clusterRoleBindings'),
    [history])
  const [clusterRoleBindings] = useDataLoader(clusterRoleBindingActions.list, { clusterId: allKey })
  const clusterRoleBinding = useMemo(
    () => clusterRoleBindings.find(propEq('id', clusterRoleBindingId)) || emptyObj,
    [clusterRoleBindings, clusterRoleBindingId])
  const { params, updateParams, getParamsUpdater } = useParams(defaultParams)

  const [updateClusterRoleBindingAction] = useDataUpdater(clusterRoleBindingActions.update, onComplete)
  const handleSubmit = params => data => updateClusterRoleBindingAction({ ...data, ...params })
  useEffect(() => {
    updateParams({
      users: clusterRoleBinding.users,
      groups: clusterRoleBinding.groups,
      name: clusterRoleBinding.name,
      role: clusterRoleBinding.roleRef,
      clusterId: clusterRoleBinding.clusterId,
    })
  }, [clusterRoleBinding])

  return (
    <FormWrapper
      title="Edit Cluster Role Binding"
      backUrl='/ui/kubernetes/rbac#clusterRoleBindings'
    >
      <ValidatedForm onSubmit={handleSubmit(params)}>
        <PresetField label='Name' value={clusterRoleBinding.name} />
        <PresetField label='Cluster' value={clusterRoleBinding.clusterName} />
        { clusterRoleBinding.roleRef &&
          <PresetField label='Role' value={clusterRoleBinding.roleRef.name} />
        }
        { clusterRoleBinding.users && <UserMultiSelect
          id="users"
          info="Select users to assign this role"
          onChange={getParamsUpdater('users')}
          initialValue={clusterRoleBinding.users}
          required
        />}
        { clusterRoleBinding.groups && <GroupMultiSelect
          id="groups"
          info="Select groups to assign this role"
          onChange={getParamsUpdater('groups')}
          initialValue={clusterRoleBinding.groups}
          required
        />}
        <SubmitButton>Update Cluster Role Binding</SubmitButton>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default UpdateClusterRoleBindingPage

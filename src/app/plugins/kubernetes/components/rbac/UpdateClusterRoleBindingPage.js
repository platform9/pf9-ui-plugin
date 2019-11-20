import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import React, { useMemo, useCallback } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterRoleBindingActions } from 'k8s/components/rbac/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { emptyObj } from 'utils/fp'
import useReactRouter from 'use-react-router'
import { propEq } from 'ramda'
import useParams from 'core/hooks/useParams'
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
  const clusterId = match.params.clusterId
  const onComplete = useCallback(
    success => success && history.push('/ui/kubernetes/rbac#clusterRoleBindings'),
    [history])
  const [clusterRoleBindings, loading] = useDataLoader(clusterRoleBindingActions.list, { clusterId })
  const clusterRoleBinding = useMemo(
    () => clusterRoleBindings.find(propEq('id', clusterRoleBindingId)) || emptyObj,
    [clusterRoleBindings, clusterRoleBindingId])
  const { getParamsUpdater } = useParams(defaultParams)

  const [updateClusterRoleBindingAction, updating] = useDataUpdater(clusterRoleBindingActions.update, onComplete)
  const handleSubmit = useCallback(
    data => updateClusterRoleBindingAction(({ ...clusterRoleBinding, ...data })),
    [clusterRoleBinding])

  return (
    <FormWrapper
      title="Edit Cluster Role Binding"
      backUrl='/ui/kubernetes/rbac#clusterRoleBindings'
      loading={loading || updating}
      message={loading ? 'Loading cluster role...' : 'Submitting form...'}
    >
      <ValidatedForm onSubmit={handleSubmit}>
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
        />}
        { clusterRoleBinding.groups && <GroupMultiSelect
          id="groups"
          info="Select groups to assign this role"
          onChange={getParamsUpdater('groups')}
          initialValue={clusterRoleBinding.groups}
        />}
        <SubmitButton>Update Cluster Role Binding</SubmitButton>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default UpdateClusterRoleBindingPage

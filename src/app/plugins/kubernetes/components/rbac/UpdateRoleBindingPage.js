import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import React, { useMemo, useCallback } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { roleBindingActions } from 'k8s/components/rbac/actions'
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

const UpdateRoleBindingPage = () => {
  const { match, history } = useReactRouter()
  const roleBindingId = match.params.id
  const clusterId = match.params.clusterId
  const onComplete = useCallback(
    success => success && history.push('/ui/kubernetes/rbac#roleBindings'),
    [history])
  const [roleBindings, loading] = useDataLoader(roleBindingActions.list, { clusterId })
  const roleBinding = useMemo(
    () => roleBindings.find(propEq('id', roleBindingId)) || emptyObj,
    [roleBindings, roleBindingId])

  const { getParamsUpdater } = useParams(defaultParams)

  const [updateRoleBindingAction, updating] = useDataUpdater(roleBindingActions.update, onComplete)
  const handleSubmit = useCallback(
    data => updateRoleBindingAction(({ ...roleBinding, ...data })),
    [roleBinding])

  return (
    <FormWrapper
      title="Edit Role Binding"
      backUrl='/ui/kubernetes/rbac#roleBindings'
      loading={loading || updating}
      message={loading ? 'Loading role binding...' : 'Submitting form...'}
    >
      <ValidatedForm onSubmit={handleSubmit}>
        <PresetField label='Name' value={roleBinding.name} />
        <PresetField label='Cluster' value={roleBinding.clusterName} />
        <PresetField label='Namespace' value={roleBinding.namespace} />
        { roleBinding.roleRef &&
          <PresetField label='Role' value={roleBinding.roleRef.name} />
        }
        { roleBinding.users && <UserMultiSelect
          id="users"
          info="Select users to assign this role"
          onChange={getParamsUpdater('users')}
          initialValue={roleBinding.users}
        />}
        { roleBinding.groups && <GroupMultiSelect
          id="groups"
          info="Select groups to assign this role"
          onChange={getParamsUpdater('groups')}
          initialValue={roleBinding.groups}
        />}
        <SubmitButton>Update Role Binding</SubmitButton>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default UpdateRoleBindingPage

import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import React, { useMemo, useCallback, useEffect } from 'react'
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
  const [roleBindings] = useDataLoader(roleBindingActions.list, { clusterId })
  const roleBinding = useMemo(
    () => roleBindings.find(propEq('id', roleBindingId)) || emptyObj,
    [roleBindings, roleBindingId])
  // const [update, updating] = useDataUpdater(roleBindingActions.update, onComplete)
  const { params, updateParams, getParamsUpdater } = useParams(defaultParams)

  const [updateRoleBindingAction] = useDataUpdater(roleBindingActions.update, onComplete)
  const handleSubmit = params => data => updateRoleBindingAction({ ...data, ...params })
  useEffect(() => {
    updateParams({
      users: roleBinding.users,
      groups: roleBinding.groups,
      name: roleBinding.name,
      role: roleBinding.roleRef,
      clusterId: roleBinding.clusterId,
      namespace: roleBinding.namespace,
    })
  }, [roleBinding])

  return (
    <FormWrapper
      title="Edit Role Binding"
      backUrl='/ui/kubernetes/rbac#roleBindings'
    >
      <ValidatedForm onSubmit={handleSubmit(params)}>
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
          required
        />}
        { roleBinding.groups && <GroupMultiSelect
          id="groups"
          info="Select groups to assign this role"
          onChange={getParamsUpdater('groups')}
          initialValue={roleBinding.groups}
          required
        />}
        <SubmitButton>Update Role Binding</SubmitButton>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default UpdateRoleBindingPage

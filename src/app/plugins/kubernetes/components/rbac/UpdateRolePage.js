import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import React, { useMemo, useCallback, useEffect } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { roleActions } from 'k8s/components/rbac/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { emptyObj } from 'utils/fp'
import useReactRouter from 'use-react-router'
import { propEq } from 'ramda'
import useParams from 'core/hooks/useParams'
import RbacChecklist from './RbacChecklist'
import FormWrapper from 'core/components/FormWrapper'
import PresetField from 'core/components/PresetField'

// TODO: get default params for rbac property
const defaultParams = {
  rbac: {}
}

const UpdateRolePage = () => {
  const { match, history } = useReactRouter()
  const roleId = match.params.id
  const clusterId = match.params.clusterId
  const onComplete = useCallback(
    success => success && history.push('/ui/kubernetes/rbac'),
    [history])
  const [roles] = useDataLoader(roleActions.list, { clusterId })
  const role = useMemo(
    () => roles.find(propEq('id', roleId)) || emptyObj,
    [roles, roleId])
  const [updateRoleAction] = useDataUpdater(roleActions.update, onComplete)
  const handleSubmit = params => data => updateRoleAction({ ...data, ...params })
  const { params, updateParams, getParamsUpdater } = useParams(defaultParams)
  useEffect(() => {
    updateParams({
      name: role.name,
      clusterName: role.clusterName,
      clusterId: role.clusterId,
      namespace: role.namespace,
    })
  }, [role])

  return (
    <FormWrapper
      title="Edit Role"
      backUrl='/ui/kubernetes/rbac'
    >
      <ValidatedForm onSubmit={handleSubmit(params)}>
        <PresetField label='Name' value={role.name} />
        <PresetField label='Cluster' value={role.clusterName} />
        <PresetField label='Namespace' value={role.namespace} />
        { role.clusterId && <RbacChecklist
          id="rbac"
          clusterId={role.clusterId}
          onChange={getParamsUpdater('rbac')}
          value={params.rbac}
          initialRules={role.rules}
        /> }
        <SubmitButton>Update Role</SubmitButton>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default UpdateRolePage

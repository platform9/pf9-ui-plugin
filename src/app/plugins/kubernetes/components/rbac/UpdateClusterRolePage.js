import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import React, { useMemo, useCallback, useEffect } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterRoleActions } from 'k8s/components/rbac/actions'
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

const UpdateClusterRolePage = () => {
  const { match, history } = useReactRouter()
  const clusterRoleId = match.params.id
  const clusterId = match.params.clusterId
  const onComplete = useCallback(
    success => success && history.push('/ui/kubernetes/rbac#clusterRoles'),
    [history])
  const [clusterRoles] = useDataLoader(clusterRoleActions.list, { clusterId })
  const clusterRole = useMemo(
    () => clusterRoles.find(propEq('id', clusterRoleId)) || emptyObj,
    [clusterRoles, clusterRoleId])
  const [updateClusterRoleAction] = useDataUpdater(clusterRoleActions.update, onComplete)
  const { params, updateParams, getParamsUpdater } = useParams(defaultParams)
  const handleSubmit = data => updateClusterRoleAction({ ...data, ...params })
  useEffect(() => {
    updateParams({
      name: clusterRole.name,
      clusterName: clusterRole.clusterName,
      clusterId: clusterRole.clusterId,
    })
  }, [clusterRole])

  return (
    <FormWrapper
      title="Edit Cluster Role"
      backUrl='/ui/kubernetes/rbac#clusterRoles'
    >
      <ValidatedForm onSubmit={handleSubmit}>
        <PresetField label='Name' value={clusterRole.name} />
        <PresetField label='Cluster' value={clusterRole.clusterName} />
        { clusterRole.clusterId && <RbacChecklist
          id="rbac"
          clusterId={clusterRole.clusterId}
          onChange={getParamsUpdater('rbac')}
          value={params.rbac}
          initialRules={clusterRole.rules}
        /> }
        <SubmitButton>Update Cluster Role</SubmitButton>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default UpdateClusterRolePage

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
import { useSelector } from 'react-redux'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { pathOr, prop } from 'ramda'
import { makeStyles } from '@material-ui/styles'
import DocumentMeta from 'core/components/DocumentMeta'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

const useStyles = makeStyles((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const defaultParams = {
  users: [],
  groups: [],
}

const UpdateRoleBindingPage = () => {
  const classes = useStyles({})
  const { match, history } = useReactRouter()
  const roleBindingId = match.params.id
  const clusterId = match.params.clusterId
  const onComplete = useCallback(
    (success) => success && history.push('/ui/kubernetes/rbac#roleBindings'),
    [history],
  )
  const [roleBindings, loading] = useDataLoader(roleBindingActions.list, { clusterId })
  const roleBinding = useMemo(() => roleBindings.find(propEq('id', roleBindingId)) || emptyObj, [
    roleBindings,
    roleBindingId,
  ])

  const { getParamsUpdater } = useParams(defaultParams)

  const [updateRoleBindingAction, updating] = useDataUpdater(roleBindingActions.update, onComplete)
  const handleSubmit = useCallback((data) => updateRoleBindingAction({ ...roleBinding, ...data }), [
    roleBinding,
  ])
  const { features } = useSelector(prop(sessionStoreKey)) || {}
  const ssoEnabled = pathOr(false, ['experimental', 'sso'], features)

  return (
    <>
      <DocumentMeta title="Update Role Binding" bodyClasses={['form-view']} />
      <FormWrapper
        title="Edit Role Binding"
        backUrl="/ui/kubernetes/rbac#roleBindings"
        loading={loading || updating}
        message={loading ? 'Loading role binding...' : 'Submitting form...'}
      >
        <ValidatedForm
          elevated={false}
          onSubmit={handleSubmit}
          formActions={<SubmitButton>Update Role Binding</SubmitButton>}
          classes={{ root: classes.validatedFormContainer }}
        >
          <FormFieldCard title="Basic Details">
            <PresetField label="Name" value={roleBinding.name} />
            <PresetField label="Cluster" value={roleBinding.clusterName} />
            <PresetField label="Namespace" value={roleBinding.namespace} />
            {roleBinding.roleRef && <PresetField label="Role" value={roleBinding.roleRef.name} />}
          </FormFieldCard>
          {roleBinding.users && (
            <FormFieldCard title="Assign Users to this Binding">
              <UserMultiSelect
                id="users"
                info="Select users to assign this role"
                onChange={getParamsUpdater('users')}
                initialValue={roleBinding.users}
              />
            </FormFieldCard>
          )}
          {roleBinding.groups && ssoEnabled && (
            <FormFieldCard title="Assign Groups to this Binding">
              <GroupMultiSelect
                id="groups"
                info="Select groups to assign this role"
                onChange={getParamsUpdater('groups')}
                initialValue={roleBinding.groups}
              />
            </FormFieldCard>
          )}
        </ValidatedForm>
      </FormWrapper>
    </>
  )
}

export default UpdateRoleBindingPage

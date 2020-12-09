import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import UserMultiSelect from 'k8s/components/common/UserMultiSelect'
import GroupMultiSelect from 'k8s/components/common/GroupMultiSelect'
import RolePicklist from './RolePicklist'
import TextField from 'core/components/validatedForm/TextField'
import { clusterRoleBindingActions } from './actions'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { useSelector } from 'react-redux'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { pathOr, prop } from 'ramda'
import { makeStyles } from '@material-ui/styles'
import DocumentMeta from 'core/components/DocumentMeta'

const useStyles = makeStyles((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const defaultParams = {
  clusterId: '', // Initialize here to prevent desync with formContext
  users: [],
  groups: [],
}
export const AddClusterRoleBindingForm = () => {
  const { params, getParamsUpdater } = useParams(defaultParams)
  const classes = useStyles({})
  const { history } = useReactRouter()
  const onComplete = (success) => success && history.push('/ui/kubernetes/rbac#clusterRoleBindings')
  const [createClusterRoleBindingAction] = useDataUpdater(
    clusterRoleBindingActions.create,
    onComplete,
  )
  const handleSubmit = (params) => (data) => createClusterRoleBindingAction({ ...data, ...params })
  const { features } = useSelector(prop(sessionStoreKey)) || {}
  const ssoEnabled = pathOr(false, ['experimental', 'sso'], features)

  return (
    <>
      <DocumentMeta title="Add Cluster Role Binding" bodyClasses={['form-view']} />
      <FormWrapper
        title="Add Cluster Role Binding"
        backUrl="/ui/kubernetes/rbac#clusterRoleBindings"
      >
        <ValidatedForm
          elevated={false}
          formActions={<SubmitButton>Add Cluster Role Binding</SubmitButton>}
          onSubmit={handleSubmit(params)}
          classes={{ root: classes.validatedFormContainer }}
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
          {ssoEnabled && (
            <FormFieldCard title="Assign Groups to this Cluster Binding">
              <GroupMultiSelect
                id="groups"
                info="Select groups to assign this role"
                onChange={getParamsUpdater('groups')}
              />
            </FormFieldCard>
          )}
        </ValidatedForm>
      </FormWrapper>
    </>
  )
}

export default AddClusterRoleBindingForm

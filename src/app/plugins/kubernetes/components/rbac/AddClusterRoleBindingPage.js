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
import { makeStyles } from '@material-ui/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

const useStyles = makeStyles((theme) => ({
  formWidth: {
    width: 715,
  },
  tableWidth: {
    width: 650, // MultiSelect has a width: 100%; this is so it doesn't overlay on the card
    marginBottom: theme.spacing(),
    paddingLeft: theme.spacing(),
  },
  inputWidth: {
    maxWidth: 350,
    paddingLeft: theme.spacing(),
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
  submit: {
    display: 'flex',
    marginLeft: theme.spacing(2),
  },
}))

const defaultParams = {
  users: [],
  groups: [],
}
export const AddClusterRoleBindingForm = () => {
  const classes = useStyles()
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
      <ValidatedForm onSubmit={handleSubmit(params)}>
        <div className={classes.formWidth}>
          <FormFieldCard title="Basic Details">
            <div className={classes.inputWidth}>
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
            </div>
          </FormFieldCard>
          <FormFieldCard title="Assign Users / Groups To This Binding">
            <div className={classes.tableWidth}>
              <UserMultiSelect
                id="users"
                info="Select users to assign this role"
                onChange={getParamsUpdater('users')}
              />
              <GroupMultiSelect
                id="groups"
                info="Select groups to assign this role"
                onChange={getParamsUpdater('groups')}
              />
            </div>
          </FormFieldCard>
        </div>
        <div className={classes.submit}>
          <SubmitButton>Add Cluster Role Binding</SubmitButton>
        </div>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default AddClusterRoleBindingForm

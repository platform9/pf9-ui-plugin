import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import UserMultiSelect from 'k8s/components/common/UserMultiSelect'
import GroupMultiSelect from 'k8s/components/common/GroupMultiSelect'
import RolePicklist from './RolePicklist'
import TextField from 'core/components/validatedForm/TextField'
import { roleBindingActions } from './actions'
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
export const AddRoleBindingForm = () => {
  const classes = useStyles()
  const { params, getParamsUpdater } = useParams(defaultParams)
  const { history } = useReactRouter()
  const onComplete = (success) => success && history.push('/ui/kubernetes/rbac#roleBindings')
  const [createRoleBindingAction] = useDataUpdater(roleBindingActions.create, onComplete)
  const handleSubmit = (params) => (data) => createRoleBindingAction({ ...data, ...params })

  return (
    <FormWrapper title="Add Role Binding" backUrl="/ui/kubernetes/rbac#roleBindings">
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
                DropdownComponent={NamespacePicklist}
                disabled={!params.clusterId}
                id="namespace"
                label="Namespace"
                clusterId={params.clusterId}
                onChange={getParamsUpdater('namespace')}
                value={params.namespace}
                required
              />
              <PicklistField
                DropdownComponent={RolePicklist}
                disabled={!params.clusterId}
                id="role"
                label="Role"
                clusterId={params.clusterId}
                onChange={getParamsUpdater('role')}
                value={params.role}
                showAllRoleTypes
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
                value={params.users}
              />
              <GroupMultiSelect
                id="groups"
                info="Select groups to assign this role"
                onChange={getParamsUpdater('groups')}
                value={params.groups}
              />
            </div>
          </FormFieldCard>
        </div>
        <div className={classes.submit}>
          <SubmitButton>Add Role Binding</SubmitButton>
        </div>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default AddRoleBindingForm

import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import RbacChecklist from './RbacChecklist'
import TextField from 'core/components/validatedForm/TextField'
import { clusterRolesCacheKey } from './actions'
import useParams from 'core/hooks/useParams'
import { makeStyles } from '@material-ui/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import NoContentMessage from 'core/components/NoContentMessage'

const useStyles = makeStyles((theme) => ({
  formWidth: {
    width: 715,
  },
  tableWidth: {
    width: 687, // oddly specific, this is so the tooltip doesn't overlay on the card
    marginBottom: theme.spacing(),
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
  rbac: {},
}
export const AddClusterRoleForm = ({ onComplete }) => {
  const classes = useStyles()
  const { params, getParamsUpdater } = useParams(defaultParams)

  return (
    <ValidatedForm onSubmit={onComplete}>
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
          </div>
        </FormFieldCard>
        <FormFieldCard title="API Access / Permissions">
          <div className={classes.tableWidth}>
            {params.clusterId && (
              <RbacChecklist
                id="rbac"
                clusterId={params.clusterId}
                onChange={getParamsUpdater('rbac')}
                value={params.rbac}
              />
            )}
            {!params.clusterId && (
              <NoContentMessage
                defaultHeight={200}
                message="Please choose a cluster to define it's API access permissions."
              />
            )}
          </div>
        </FormFieldCard>
      </div>
      <div className={classes.submit}>
        <SubmitButton>Add Cluster Role</SubmitButton>
      </div>
    </ValidatedForm>
  )
}

export const options = {
  cacheKey: clusterRolesCacheKey,
  FormComponent: AddClusterRoleForm,
  listUrl: '/ui/kubernetes/rbac#clusterRoles',
  name: 'AddClusterRole',
  title: 'Add Cluster Role',
}

const { AddPage } = createAddComponents(options)

export default AddPage

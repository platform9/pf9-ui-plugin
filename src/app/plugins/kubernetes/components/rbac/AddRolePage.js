import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import RbacChecklist from './RbacChecklist'
import TextField from 'core/components/validatedForm/TextField'
import useParams from 'core/hooks/useParams'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import NoContentMessage from 'core/components/NoContentMessage'
import { ActionDataKeys } from 'k8s/DataKeys'
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
  rbac: {},
}

export const AddRoleForm = ({ onComplete }) => {
  const classes = useStyles({})
  const { params, getParamsUpdater } = useParams(defaultParams)

  return (
    <>
      <DocumentMeta title="Add Role" bodyClasses={['form-view']} />
      <ValidatedForm
        onSubmit={onComplete}
        elevated={false}
        formActions={<SubmitButton>Add Role</SubmitButton>}
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
            DropdownComponent={NamespacePicklist}
            disabled={!params.clusterId}
            id="namespace"
            label="Namespace"
            clusterId={params.clusterId}
            onChange={getParamsUpdater('namespace')}
            value={params.namespace}
            required
          />
        </FormFieldCard>
        <FormFieldCard title="API Access / Permissions">
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
        </FormFieldCard>
      </ValidatedForm>
    </>
  )
}

export const options = {
  cacheKey: ActionDataKeys.KubeRoles,
  FormComponent: AddRoleForm,
  listUrl: '/ui/kubernetes/rbac',
  name: 'AddRole',
  title: 'Add Role',
}

const { AddPage } = createAddComponents(options)

export default AddPage

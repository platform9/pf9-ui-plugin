import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import React, { useMemo, useCallback } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterRoleActions } from 'k8s/components/rbac/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { emptyObj } from 'utils/fp'
import useReactRouter from 'use-react-router'
import { propEq } from 'ramda'
import RbacChecklist from './RbacChecklist'
import FormWrapper from 'core/components/FormWrapper'
import PresetField from 'core/components/PresetField'
import { makeStyles } from '@material-ui/styles'
import DocumentMeta from 'core/components/DocumentMeta'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

const useStyles = makeStyles((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const UpdateClusterRolePage = () => {
  const classes = useStyles({})
  const { match, history } = useReactRouter()
  const clusterRoleId = match.params.id
  const clusterId = match.params.clusterId
  const onComplete = useCallback(
    (success) => success && history.push('/ui/kubernetes/rbac#clusterRoles'),
    [history],
  )
  const [clusterRoles, loading] = useDataLoader(clusterRoleActions.list, { clusterId })
  const clusterRole = useMemo(() => clusterRoles.find(propEq('id', clusterRoleId)) || emptyObj, [
    clusterRoles,
    clusterRoleId,
  ])
  const [updateClusterRoleAction, updating] = useDataUpdater(clusterRoleActions.update, onComplete)
  const handleSubmit = useCallback((data) => updateClusterRoleAction({ ...clusterRole, ...data }), [
    clusterRole,
  ])

  return (
    <FormWrapper
      title="Edit Cluster Role"
      backUrl="/ui/kubernetes/rbac#clusterRoles"
      loading={loading || updating}
      message={loading ? 'Loading cluster role...' : 'Submitting form...'}
    >
      <>
        <DocumentMeta title="Update Cluster Role" bodyClasses={['form-view']} />
        <ValidatedForm
          elevated={false}
          onSubmit={handleSubmit}
          formActions={<SubmitButton>Update Cluster Role</SubmitButton>}
          classes={{ root: classes.validatedFormContainer }}
        >
          <FormFieldCard title="Basic Details">
            <PresetField label="Name" value={clusterRole.name} />
            <PresetField label="Cluster" value={clusterRole.clusterName} />
          </FormFieldCard>
          {clusterRole.clusterId && (
            <FormFieldCard title="API Access / Permissions">
              <RbacChecklist
                id="rbac"
                clusterId={clusterRole.clusterId}
                initialRules={clusterRole.rules}
              />
            </FormFieldCard>
          )}
        </ValidatedForm>
      </>
    </FormWrapper>
  )
}

export default UpdateClusterRolePage

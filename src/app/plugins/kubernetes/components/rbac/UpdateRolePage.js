import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import React, { useMemo, useCallback } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { roleActions } from 'k8s/components/rbac/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { emptyObj } from 'utils/fp'
import useReactRouter from 'use-react-router'
import { propEq } from 'ramda'
import RbacChecklist from './RbacChecklist'
import FormWrapper from 'core/components/FormWrapper'
import PresetField from 'core/components/PresetField'
import { k8sPrefix } from 'app/constants'
import { pathJoin } from 'utils/misc'
import { makeStyles } from '@material-ui/styles'
import DocumentMeta from 'core/components/DocumentMeta'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

const useStyles = makeStyles((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const backUrl = pathJoin(k8sPrefix, 'rbac')

const UpdateRolePage = () => {
  const classes = useStyles({})
  const { match, history } = useReactRouter()
  const roleId = match.params.id
  const clusterId = match.params.clusterId
  const onComplete = useCallback((success) => success && history.push(backUrl), [history])
  const [roles, loading] = useDataLoader(roleActions.list, { clusterId })
  const role = useMemo(() => roles.find(propEq('id', roleId)) || emptyObj, [roles, roleId])
  const [updateRoleAction, updating] = useDataUpdater(roleActions.update, onComplete)
  const handleSubmit = useCallback((data) => updateRoleAction({ ...role, ...data }), [role])

  return (
    <>
      <DocumentMeta title="Update Role" bodyClasses={['form-view']} />
      <FormWrapper
        title="Edit Role"
        backUrl={backUrl}
        loading={loading || updating}
        message={loading ? 'Loading role...' : 'Submitting form...'}
      >
        <ValidatedForm
          elevated={false}
          onSubmit={handleSubmit}
          formActions={<SubmitButton>Update Role</SubmitButton>}
          classes={{ root: classes.validatedFormContainer }}
        >
          <FormFieldCard title="Basic Details">
            <PresetField label="Name" value={role.name} />
            <PresetField label="Cluster" value={role.clusterName} />
            <PresetField label="Namespace" value={role.namespace} />
          </FormFieldCard>
          {role.clusterId && (
            <FormFieldCard title="API Access / Permissions">
              <RbacChecklist id="rbac" clusterId={role.clusterId} initialRules={role.rules} />
            </FormFieldCard>
          )}
        </ValidatedForm>
      </FormWrapper>
    </>
  )
}

export default UpdateRolePage

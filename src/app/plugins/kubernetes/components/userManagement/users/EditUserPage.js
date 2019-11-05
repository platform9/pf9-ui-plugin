import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import React, { useMemo, useCallback } from 'react'
import { Typography } from '@material-ui/core'
import TenantRolesTableField from 'k8s/components/userManagement/users/TenantRolesTableField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import {
  mngmTenantActions, mngmTenantRoleAssignmentsLoader,
} from 'k8s/components/userManagement/tenants/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { mngmUserActions } from 'k8s/components/userManagement/users/actions'
import { emptyObj, pathStr } from 'utils/fp'
import useReactRouter from 'use-react-router'
import FormWrapper from 'core/components/FormWrapper'
import { propEq } from 'ramda'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'

const listUrl = pathJoin(k8sPrefix, 'user_management')

const EditUserPage = () => {
  const { match, history } = useReactRouter()
  const userId = match.params.id
  const onComplete = useCallback(
    success => success && history.push(listUrl),
    [history])
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const tenant = useMemo(
    () => users.find(propEq('id', userId)) || emptyObj,
    [users, userId])
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const [update, updating] = useDataUpdater(mngmUserActions.update, onComplete)
  const [roleAssignments, loadingRoleAssignments] = useDataLoader(mngmTenantRoleAssignmentsLoader, {
    userId,
  })
  const initialContext = useMemo(() => ({
    id: userId,
    name: tenant.name,
    displayName: tenant.displayName || '',
    roleAssignments: roleAssignments.reduce((acc, roleAssignment) => ({
      ...acc,
      [pathStr('user.id', roleAssignment)]: pathStr('role.id', roleAssignment),
    }), {}),
  }), [tenant, roleAssignments])

  return <FormWrapper
    title={`Edit User ${tenant.name}`}
    loading={loadingUsers || loadingTenants || loadingRoleAssignments || updating}
    renderContentOnMount={false}
    message={updating ? 'Submitting form...' : 'Loading User...'}
    backUrl={listUrl}>
    <Wizard onComplete={update} context={initialContext}>
      {({ wizardContext, setWizardContext, onNext }) => <>
        <WizardStep stepId="basic" label="Basic Info">
          <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
            <TextField id="name" label="User Name" required />
            <TextField id="displayName" label="Display Name" />
          </ValidatedForm>
        </WizardStep>
        <WizardStep stepId="tenants" label="Tenants and Roles">
          <Typography variant="body1" component="p">
            Which users can access this tenant?
          </Typography>
          <ValidatedForm fullWidth initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
            <TenantRolesTableField required id="roleAssignments" tenants={tenants} />
          </ValidatedForm>
        </WizardStep>
      </>}
    </Wizard>
  </FormWrapper>
}

export default EditUserPage

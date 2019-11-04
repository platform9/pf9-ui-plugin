import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import React, { useMemo, useCallback } from 'react'
import { Typography } from '@material-ui/core'
import UserRolesTableField from 'k8s/components/userManagement/tenants/UserRolesTableField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import {
  mngmTenantActions, mngmRoleAssignmentsLoader,
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

const EditTenantPage = () => {
  const { match, history } = useReactRouter()
  const tenantId = match.params.id
  const onComplete = useCallback(
    success => success && history.push(listUrl),
    [history])
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const tenant = useMemo(
    () => tenants.find(propEq('id', tenantId)) || emptyObj,
    [tenants, tenantId])
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const [update, updating] = useDataUpdater(mngmTenantActions.update, onComplete)
  const [roleAssignments, loadingRoleAssignments] = useDataLoader(mngmRoleAssignmentsLoader, {
    tenantId,
  })
  const initialContext = useMemo(() => ({
    id: tenantId,
    name: tenant.name,
    description: tenant.description || '',
    roleAssignments: roleAssignments.reduce((acc, roleAssignment) => ({
      ...acc,
      [pathStr('user.id', roleAssignment)]: pathStr('role.id', roleAssignment),
    }), {}),
  }), [tenant, roleAssignments])

  return <FormWrapper
    title={`Edit Tenant ${tenant.name}`}
    loading={loadingUsers || loadingTenants || loadingRoleAssignments || updating}
    renderContentOnMount={false}
    message={updating ? 'Submitting form...' : 'Loading Tenant...'}
    backUrl={listUrl}>
    <Wizard onComplete={update} context={initialContext}>
      {({ wizardContext, setWizardContext, onNext }) => <>
        <WizardStep stepId="basic" label="Basic Info">
          <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
            <TextField id="name" label="Name" required />
            <TextField id="description" label="Description" />
          </ValidatedForm>
        </WizardStep>
        <WizardStep stepId="users" label="Users and Roles">
          <Typography variant="body1" component="p">
            Which users can access this tenant?
          </Typography>
          <ValidatedForm fullWidth initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
            <UserRolesTableField required id="roleAssignments" users={users} />
          </ValidatedForm>
        </WizardStep>
      </>}
    </Wizard>
  </FormWrapper>
}

export default EditTenantPage

import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import React, { useMemo, useCallback } from 'react'
import UserRolesTableField from 'account/components/userManagement/tenants/UserRolesTableField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import {
  mngmTenantActions,
  mngmTenantRoleAssignmentsLoader,
} from 'account/components/userManagement/tenants/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { mngmUserActions } from 'account/components/userManagement/users/actions'
import { emptyObj, pathStr } from 'utils/fp'
import useReactRouter from 'use-react-router'
import FormWrapper from 'core/components/FormWrapper'
import { propEq } from 'ramda'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { requiredValidator } from 'core/utils/fieldValidators'
import { Redirect } from 'react-router'
import { routes } from 'core/utils/routes'

const listUrl = routes.userManagement.tenants.path()

const userParams = { systemUsers: true }

const userRolesValidations = [requiredValidator.withMessage('Must select at least one user')]

const EditTenantPage = () => {
  const { match, history } = useReactRouter()
  const tenantId = match.params.id
  const onComplete = useCallback((success) => success && history.push(listUrl), [history])
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const tenant = useMemo(() => tenants.find(propEq('id', tenantId)) || emptyObj, [
    tenants,
    tenantId,
  ])
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list, userParams)
  const [update, updating] = useDataUpdater(mngmTenantActions.update, onComplete)
  const [roleAssignments, loadingRoleAssignments] = useDataLoader(mngmTenantRoleAssignmentsLoader, {
    tenantId,
  })
  const initialContext = useMemo(
    () => ({
      id: tenantId,
      name: tenant.name,
      description: tenant.description || '',
      roleAssignments: roleAssignments.reduce(
        (acc, roleAssignment) => ({
          ...acc,
          [pathStr('user.id', roleAssignment)]: pathStr('role.id', roleAssignment),
        }),
        {},
      ),
    }),
    [tenant, roleAssignments],
  )
  const loadingSomething = loadingUsers || loadingTenants || loadingRoleAssignments || updating

  if (tenant.name === 'service') {
    return <Redirect to={routes.userManagement.tenants.path()} />
  }

  return (
    <FormWrapper
      title={`Edit Tenant ${tenant.name || ''}`}
      loading={loadingSomething}
      renderContentOnMount={!loadingSomething}
      message={updating ? 'Submitting form...' : 'Loading Tenant...'}
      backUrl={listUrl}
    >
      <Wizard onComplete={update} context={initialContext}>
        {({ wizardContext, setWizardContext, onNext }) => (
          <>
            <WizardStep stepId="basic" label="Basic Info">
              <ValidatedForm
                title="Basic Info"
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                <TextField id="name" label="Name" required />
                <TextField id="description" label="Description" />
              </ValidatedForm>
            </WizardStep>
            <WizardStep stepId="users" label="Users and Roles">
              <ValidatedForm
                title="Users and Roles"
                fullWidth
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                <UserRolesTableField
                  validations={userRolesValidations}
                  id="roleAssignments"
                  users={users}
                />
              </ValidatedForm>
            </WizardStep>
          </>
        )}
      </Wizard>
    </FormWrapper>
  )
}

export default EditTenantPage

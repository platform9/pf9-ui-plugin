import React, { useCallback } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import FormWrapper from 'core/components/FormWrapper'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useDataLoader from 'core/hooks/useDataLoader'
import UserRolesTableField from 'account/components/userManagement/tenants/UserRolesTableField'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import { mngmUserActions } from 'account/components/userManagement/users/actions'
import Progress from 'core/components/progress/Progress'
import { requiredValidator } from 'core/utils/fieldValidators'
import { routes } from 'core/utils/routes'

const listUrl = routes.userManagement.tenants.path()

const initialContext = {
  name: '',
  description: '',
  roleAssignments: {},
}

const userParams = { systemUsers: true }

const userRolesValidations = [requiredValidator.withMessage('Must select at least one user')]

const AddTenantPage = () => {
  const { history } = useReactRouter()
  const onComplete = useCallback((success) => success && history.push(listUrl), [history])
  const [handleAdd, submitting] = useDataUpdater(mngmTenantActions.create, onComplete)
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list, userParams)

  return (
    <FormWrapper title="New Tenant" loading={submitting} backUrl={listUrl}>
      <Wizard onComplete={handleAdd} context={initialContext}>
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
                <Progress
                  renderContentOnMount={!loadingUsers}
                  loading={loadingUsers}
                  message={'Loading Users...'}
                >
                  <UserRolesTableField
                    validations={userRolesValidations}
                    id="roleAssignments"
                    users={users}
                  />
                </Progress>
              </ValidatedForm>
            </WizardStep>
          </>
        )}
      </Wizard>
    </FormWrapper>
  )
}

export default AddTenantPage

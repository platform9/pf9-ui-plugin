import React, { useCallback } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import FormWrapper from 'core/components/FormWrapper'
import { Typography } from '@material-ui/core'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { k8sPrefix } from 'app/constants'
import { pathJoin } from 'utils/misc'
import useDataLoader from 'core/hooks/useDataLoader'
import UserRolesTableField from 'k8s/components/userManagement/tenants/UserRolesTableField'
import { mngmTenantActions } from 'k8s/components/userManagement/tenants/actions'
import { mngmUserActions } from 'k8s/components/userManagement/users/actions'
import Progress from 'core/components/progress/Progress'

const listUrl = pathJoin(k8sPrefix, 'user_management')

const initialContext = {
  name: '',
  description: '',
  roleAssignments: {},
}

const userParams = { systemUsers: true }

const AddTenantPage = () => {
  const { history } = useReactRouter()
  const onComplete = useCallback(success => success && history.push(listUrl), [history])
  const [handleAdd, submitting] = useDataUpdater(mngmTenantActions.create, onComplete)
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list, userParams)

  return <FormWrapper
    title="New Tenant"
    loading={submitting}
    backUrl={listUrl}>
    <Wizard onComplete={handleAdd} context={initialContext}>
      {({ wizardContext, setWizardContext, onNext }) => <>
        <WizardStep stepId="basic" label="Basic Info">
          <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
            <TextField id="name" label="Name" required />
            <TextField id="description" label="Description" />
          </ValidatedForm>
        </WizardStep>
        <WizardStep stepId="users" label="Users and Roles">
          <Typography variant="body1" component="p">
            Select one or more users that should map to this Tenant. These are the only users that
            can access this Tenant, and hence the clusters that map to this Tenant.
          </Typography>
          <ValidatedForm fullWidth initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
            <Progress renderContentOnMount={!loadingUsers} loading={loadingUsers} message={'Loading Users...'}>
              <UserRolesTableField required id="roleAssignments" users={users} />
            </Progress>
          </ValidatedForm>
        </WizardStep>
      </>}
    </Wizard>
  </FormWrapper>
}

export default AddTenantPage

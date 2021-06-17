import React, { useCallback, useState } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import FormWrapper from 'core/components/FormWrapper'
import Text from 'core/elements/text'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useDataLoader from 'core/hooks/useDataLoader'
import TenantRolesTableField from 'account/components/userManagement/users/TenantRolesTableField'
import { mngmUserActions } from 'account/components/userManagement/users/actions'
import Progress from 'core/components/progress/Progress'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import UserPasswordField from 'account/components/userManagement/users/UserPasswordField'
import { requiredValidator, emailValidator } from 'core/utils/fieldValidators'
import { routes } from 'core/utils/routes'

const listUrl = routes.userManagement.users.path()

const initialContext = {
  username: '',
  displayname: '',
  password: '',
  roleAssignments: {},
}
const tenantRolesValidations = [requiredValidator.withMessage('Must select at least one tenant')]

export const activationByEmailLabel = (
  <>
    <div>Send activation email to the user.</div>
    <Text variant="body2" component="p" color="textSecondary">
      Instructions to create a new password and to activate account will be sent to the email
      provided.
    </Text>
  </>
)
export const createUserPasswordLabel = (
  <>
    <div>Set password for new user now.</div>
    <Text variant="body2" component="p" color="textSecondary">
      Create password for the new user now and activate the account immediately.
    </Text>
  </>
)

const AddUserPage = () => {
  const { history } = useReactRouter()
  const onComplete = useCallback((success) => success && history.push(listUrl), [history])
  const [handleAdd, submitting] = useDataUpdater(mngmUserActions.create, onComplete)
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const [activationType, setActivationType] = useState('createPassword')

  return (
    <FormWrapper title="New User" loading={submitting} backUrl={listUrl}>
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
                {({ values }) => (
                  <>
                    <TextField
                      id="username"
                      label="Email"
                      validations={[emailValidator]}
                      required
                    />
                    <TextField id="displayname" label="Display Name" />
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        <p>Activate User Account</p>
                      </FormLabel>
                      <RadioGroup
                        value={activationType}
                        onChange={(e) => setActivationType(e.target.value)}
                      >
                        {
                          <FormControlLabel
                            value="activationByEmail"
                            control={<Radio color="primary" />}
                            label={activationByEmailLabel}
                          />
                        }
                        <br />
                        <FormControlLabel
                          value="createPassword"
                          control={<Radio color="primary" />}
                          label={createUserPasswordLabel}
                        />
                      </RadioGroup>
                    </FormControl>
                    {activationType === 'createPassword' && (
                      <UserPasswordField value={values.password} />
                    )}
                  </>
                )}
              </ValidatedForm>
            </WizardStep>
            <WizardStep stepId="tenants" label="Tenants and Roles">
              <ValidatedForm
                title="Tenants and Roles"
                fullWidth
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                <Progress
                  renderContentOnMount={!loadingTenants}
                  loading={loadingTenants}
                  message={'Loading Tenants...'}
                >
                  <TenantRolesTableField
                    validations={tenantRolesValidations}
                    id="roleAssignments"
                    tenants={tenants}
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

export default AddUserPage

import React, { useCallback, useState } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import FormWrapper from 'core/components/FormWrapper'
import { Typography, List } from '@material-ui/core'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { k8sPrefix } from 'app/constants'
import { pathJoin } from 'utils/misc'
import useDataLoader from 'core/hooks/useDataLoader'
import TenantRolesTableField from 'k8s/components/userManagement/users/TenantRolesTableField'
import { mngmUserActions } from 'k8s/components/userManagement/users/actions'
import Progress from 'core/components/progress/Progress'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import ListItemText from '@material-ui/core/ListItemText'
import { propSatisfies } from 'ramda'
import {
  hasOneSpecialChar, hasOneNumber, hasOneUpperChar, hasOneLowerChar, hasMinLength,
  requiredValidator, passwordValidator,
} from 'core/utils/fieldValidators'
import { mngmTenantActions } from 'k8s/components/userManagement/tenants/actions'

const listUrl = pathJoin(k8sPrefix, 'user_management')

const initialContext = {
  name: '',
  displayName: '',
  password: '',
  roleAssignments: {},
}

const CheckListItem = ({ children, checked }) => <ListItem>
  <ListItemIcon>
    {checked ? <CheckIcon /> : <ClearIcon color="error" />}
  </ListItemIcon>
  <ListItemText primary={children} />
</ListItem>

const passwordValidators = [requiredValidator, passwordValidator]

const AddUserPage = () => {
  const { history } = useReactRouter()
  const onComplete = useCallback(success => success && history.push(listUrl), [history])
  const [handleAdd, submitting] = useDataUpdater(mngmUserActions.create, onComplete)
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const [activationType, setActivationType] = useState('activationByEmail')

  const activationByEmailLabel = <>
    <div>Send activation email to the user.</div>
    <Typography variant="body2" component="p" color="textSecondary">
      Instructions to create a new password and to activate account will be sent to
      the email provided.
    </Typography>
  </>
  const createUserPasswordLabel = <>
    <div>Set password for new user now.</div>
    <Typography variant="body2" component="p" color="textSecondary">
      Create password for the new user now and activate the account immediately.
    </Typography>
  </>
  return <FormWrapper
    title="New User"
    loading={submitting}
    backUrl={listUrl}>
    <Wizard onComplete={handleAdd} context={initialContext}>
      {({ wizardContext, setWizardContext, onNext }) => <>
        <WizardStep stepId="basic" label="Basic Info">
          <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
            {({ values }) => <>
              <TextField id="name" label="User Name" required />
              <TextField id="displayName" label="Display Name" />
              <FormControl component="fieldset">
                <FormLabel component="legend"><p>Activate User Account</p></FormLabel>
                <RadioGroup value={activationType} onChange={
                  e => setActivationType(e.target.value)}>
                  <FormControlLabel
                    value="activationByEmail"
                    control={<Radio />}
                    label={activationByEmailLabel} />
                  <br />
                  <FormControlLabel
                    value="createPassword"
                    control={<Radio />}
                    label={createUserPasswordLabel} />
                </RadioGroup>
              </FormControl>
              {activationType === 'createPassword' && <>
                <TextField id="password" label="Password" type="password" validations={passwordValidators} />
                <Typography variant="body1" component="div">
                  Password must contain the following:
                  <List dense>
                    <CheckListItem checked={propSatisfies(hasMinLength(8), 'password', values)}>
                      At least 8 characters long
                    </CheckListItem>
                    <CheckListItem checked={propSatisfies(hasOneLowerChar, 'password', values)}>
                      1 Lowercase letter
                    </CheckListItem>
                    <CheckListItem checked={propSatisfies(hasOneUpperChar, 'password', values)}>
                      1 Uppercase letter
                    </CheckListItem>
                    <CheckListItem checked={propSatisfies(hasOneNumber, 'password', values)}>
                      1 Number
                    </CheckListItem>
                    <CheckListItem checked={propSatisfies(hasOneSpecialChar, 'password', values)}>
                      1 Special character - !@#$%^&*()?
                    </CheckListItem>
                  </List>
                </Typography>
              </>}
            </>}
          </ValidatedForm>
        </WizardStep>
        <WizardStep stepId="tenants" label="Tenants and Roles">
          <Typography variant="body1" component="p">
            Select one or more tenants that should map to this User.
          </Typography>
          <ValidatedForm fullWidth initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
            <Progress renderContentOnMount={!loadingTenants} loading={loadingTenants} message={'Loading Tenants...'}>
              <TenantRolesTableField required id="roleAssignments" tenants={tenants} />
            </Progress>
          </ValidatedForm>
        </WizardStep>
      </>}
    </Wizard>
  </FormWrapper>
}

export default AddUserPage

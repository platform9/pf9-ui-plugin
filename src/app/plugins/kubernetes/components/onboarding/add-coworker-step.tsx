import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@material-ui/core'
import {
  activationByEmailLabel,
  createUserPasswordLabel,
} from 'app/plugins/account/components/userManagement/users/AddUserPage'
import UserPasswordField from 'app/plugins/account/components/userManagement/users/UserPasswordField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { emailValidator } from 'core/utils/fieldValidators'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { useSelector } from 'react-redux'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { RootState } from 'app/store'
import { prop } from 'ramda'
import useDataLoader from 'core/hooks/useDataLoader'
import { mngmRoleActions } from 'app/plugins/account/components/userManagement/roles/actions'
import { mngmUserActions } from 'app/plugins/account/components/userManagement/users/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

const initialValues = {
  username: '',
  displayname: '',
  password: '',
}

const defaultRoleName = 'admin'

const AddCoworkerStep = ({ wizardContext, setWizardContext, onNext, setSubmitting }) => {
  const [, , getUserPrefs] = useScopedPreferences()
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { username } = session
  const { currentTenant } = getUserPrefs(username)
  const [roles] = useDataLoader(mngmRoleActions.list)
  const defaultRoleId = useMemo(() => roles.find((role) => role.name === defaultRoleName)?.id, [
    roles,
  ])
  const [activationType, setActivationType] = useState('createPassword')
  const [addUser] = useDataUpdater(mngmUserActions.create)
  const validatorRef = useRef(null)

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }

    const data = {
      ...wizardContext,
      roleAssignments: { [currentTenant]: defaultRoleId },
    }
    await addUser(data)

    setSubmitting(false)
    return true
  }, [wizardContext])

  useEffect(() => {
    onNext(handleSubmit)
  }, [handleSubmit])

  return (
    <ValidatedForm initialValues={initialValues} elevated={false} triggerSubmit={setupValidator}>
      {({ values }) => (
        <FormFieldCard title="Add a User">
          <TextField
            id="username"
            label="Email"
            value={wizardContext.username}
            onChange={(value) => setWizardContext({ username: value })}
            validations={[emailValidator]}
            required
          />
          <TextField
            id="displayname"
            label="Display Name"
            value={wizardContext.displayname}
            onChange={(value) => setWizardContext({ displayname: value })}
          />
          <FormControl component="fieldset">
            <FormLabel component="legend">
              <p>Activate User Account</p>
            </FormLabel>
            <RadioGroup value={activationType} onChange={(e) => setActivationType(e.target.value)}>
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
            <UserPasswordField
              value={values.password}
              onChange={(value) => setWizardContext({ password: value })}
            />
          )}
        </FormFieldCard>
      )}
    </ValidatedForm>
  )
}

export default AddCoworkerStep

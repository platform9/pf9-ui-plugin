// @ts-nocheck
import React, { useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@material-ui/core'
import {
  activationByEmailLabel,
  createUserPasswordLabel,
} from 'app/plugins/account/components/userManagement/users/AddUserPage'
import UserPasswordField from 'app/plugins/account/components/userManagement/users/UserPasswordField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { emailValidator } from 'core/utils/fieldValidators'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { useSelector } from 'react-redux'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { RootState } from 'app/store'
import { prop } from 'ramda'
import useDataLoader from 'core/hooks/useDataLoader'
import { mngmRoleActions } from 'app/plugins/account/components/userManagement/roles/actions'
import { mngmUserActions } from 'app/plugins/account/components/userManagement/users/actions'
import Progress from 'core/components/progress/Progress'
import useDataUpdater from 'core/hooks/useDataUpdater'

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    gridColumn: '2',
    marginTop: theme.spacing(3),
    width: 'max-content',
  },
}))

const initialValues = {
  username: '',
  displayname: '',
  password: '',
}

const defaultRoleName = 'admin'

const AddCoworkerStep = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [, , getUserPrefs] = useScopedPreferences()
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { username } = session
  const { currentTenant } = getUserPrefs(username)
  const [roles] = useDataLoader(mngmRoleActions.list)
  const defaultRoleId = useMemo(() => roles.find((role) => role.name === defaultRoleName)?.id, [
    roles,
  ])
  const [activationType, setActivationType] = useState('createPassword')
  const [addUser, addingUser] = useDataUpdater(
    mngmUserActions.create,
    (success) => success && history.push(routes.cluster.list.path()),
  )

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      roleAssignments: { [currentTenant]: defaultRoleId },
    }
    await addUser(data)
  }

  return (
    <Progress message={'Adding user...'} loading={addingUser}>
      <ValidatedForm
        //   title="Basic Info"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        elevated={false}
        // triggerSubmit={onNext}
      >
        {({ values }) => (
          <>
            <TextField id="username" label="Email" validations={[emailValidator]} required />
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
            {activationType === 'createPassword' && <UserPasswordField value={values.password} />}
            {/* <SubmitButton className={classes.button}>+ Invite and Done</SubmitButton> */}
          </>
        )}
      </ValidatedForm>
    </Progress>
  )
}

export default AddCoworkerStep

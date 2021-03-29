import React, { useEffect, useMemo, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { sessionActions, SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { prop } from 'ramda'
import { mngmUserActions, updateUserPassword } from '../userManagement/users/actions'
import UserPasswordField from '../userManagement/users/UserPasswordField'
import DocumentMeta from 'core/components/DocumentMeta'
import Avatar from 'core/components/Avatar'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'
import ApiClient from 'api-client/ApiClient'
import { useDispatch, useSelector } from 'react-redux'
import Progress from 'core/components/progress/Progress'
import { RootState } from 'app/store'
import { emailValidator } from 'core/utils/fieldValidators'
import useScopedPreferences from 'core/session/useScopedPreferences'
import TenantsAndRoleAccessTable from './tenants-and-role-access-table'

const useStyles = makeStyles((theme: Theme) => ({
  userProfile: {
    marginTop: theme.spacing(1.5),
  },
  form: {
    marginTop: theme.spacing(2),
  },
  userDetails: {
    display: 'grid',
    gridTemplateColumns: '200px 400px',
  },
  avatar: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
    paddingRight: theme.spacing(3),
  },
  inputField: {
    width: '100% !important',
  },
  button: {
    gridColumn: '2',
    marginTop: theme.spacing(3),
    width: 'max-content',
  },
  passwordForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  confirmPasswordField: {
    gridColumn: '2',
  },
}))

const { setActiveRegion } = ApiClient.getInstance()

const MyProfilePage = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [prefs, updatePrefs] = useScopedPreferences()
  const [errorMessage, setErrorMessage] = useState('')
  const [oldUserPrefs, setOldUserPrefs] = useState(prefs)
  const [userUpdated, setUserUpdated] = useState(false)
  const userIdFormFieldSetter = useRef(null)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { userDetails } = session
  const { id: userId, displayName, email, role } = userDetails
  const isAdmin = role === 'admin'

  const [update, updatingUser] = useDataUpdater(mngmUserActions.update)

  const userInfo = useMemo(
    () => ({
      id: userId,
      username: email,
      displayname: displayName || '',
      email,
    }),
    [displayName, email],
  )

  const loadingSomething = updatingUser || updatingPassword

  useEffect(() => {
    // Reset the initial values for the user ID form with the new updated values
    userIdFormFieldSetter.current.setField('email')(email)
    userIdFormFieldSetter.current.setField('displayName')(displayName)
  }, [displayName, email])

  useEffect(() => {
    // Whenever the user's email gets updated, transfer their old prefs over to the new email
    if (userUpdated) {
      updatePrefs(oldUserPrefs)
      if (oldUserPrefs.currentRegion) {
        setActiveRegion(oldUserPrefs.currentRegion)
      }
      setUserUpdated(false)
    }
  }, [email])

  const setupUserIdFieldSetter = (setField) => {
    userIdFormFieldSetter.current = { setField }
  }

  const handleUserIdUpdate = async (values) => {
    // Save the prefs under the old email to transfer to the new email
    setOldUserPrefs(prefs)

    const user = {
      ...userInfo,
      username: values.email || userInfo.email,
      displayname: values.displayname || userInfo.displayname,
    }
    const [updated, updatedUser] = await update(user)

    if (updated) {
      setUserUpdated(true)

      dispatch(
        sessionActions.updateSession({
          username: updatedUser.email,
          userDetails: {
            ...userDetails,
            username: updatedUser.email,
            name: updatedUser.email,
            email: updatedUser.email,
            displayName: updatedUser.displayname, // displayName is a UI variable
            displayname: updatedUser.displayname, // displayname is what we get from the api
          },
        }),
      )
    }
  }

  const handlePasswordUpdate = async ({ currentPassword, newPassword, confirmedPassword }) => {
    setUpdatingPassword(true)
    if (newPassword !== confirmedPassword) {
      setErrorMessage('New passwords do not match.')
      return
    }
    setErrorMessage('')
    const success = await updateUserPassword({ id: userId, email, currentPassword, newPassword })
    setUpdatingPassword(false)
    if (!success) {
      setErrorMessage('Unable to update password')
    }
  }

  return (
    <div className={classes.userProfile}>
      <DocumentMeta title="User Settings" bodyClasses={['form-view']} />
      <Progress
        message={updatingUser || updatingPassword ? 'Updating user ...' : 'Loading user ...'}
        loading={loadingSomething}
      >
        <ValidatedForm
          fullWidth
          initialValues={userInfo}
          onSubmit={handleUserIdUpdate}
          fieldSetter={setupUserIdFieldSetter}
        >
          <FormFieldCard title="User ID">
            <div className={classes.userDetails}>
              <div className={classes.avatar}>
                <Avatar displayName={displayName} diameter={80} fontSize={18} />
              </div>
              <div>
                <TextField
                  className={classes.inputField}
                  id="email"
                  label="Email"
                  validations={[emailValidator]}
                  disabled={!isAdmin}
                />
                <TextField
                  className={classes.inputField}
                  id="displayname"
                  label="Display Name"
                  disabled={!isAdmin}
                />
                {isAdmin && <SubmitButton className={classes.button}>Update</SubmitButton>}
              </div>
            </div>
          </FormFieldCard>
        </ValidatedForm>
        <ValidatedForm
          classes={{ root: classes.form }}
          onSubmit={handlePasswordUpdate}
          clearOnSubmit
        >
          {({ values }) => (
            <FormFieldCard title="Password">
              <div className={classes.passwordForm}>
                <UserPasswordField
                  id="currentPassword"
                  label="Current Password"
                  value={values.currentPassword}
                  showPasswordRequirements={false}
                />
                <UserPasswordField
                  id="newPassword"
                  label="New Password"
                  value={values.newPassword}
                />
                <UserPasswordField
                  id="confirmedPassword"
                  label="Confirm New Password"
                  value={values.confirmedPassword}
                  showPasswordRequirements={false}
                />
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                <SubmitButton className={classes.button}>Update</SubmitButton>
              </div>
            </FormFieldCard>
          )}
        </ValidatedForm>
        {isAdmin && (
          <FormFieldCard className={classes.form} title="Tenants & Role Access">
            <TenantsAndRoleAccessTable userId={userId} />
          </FormFieldCard>
        )}
      </Progress>
    </div>
  )
}

export default MyProfilePage

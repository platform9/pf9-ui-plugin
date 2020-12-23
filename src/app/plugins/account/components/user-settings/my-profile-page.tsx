import React, { useEffect, useMemo, useRef, useState } from 'react'
import { makeStyles, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import Theme from 'core/themes/model'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Text from 'core/elements/text'
import useDataLoader from 'core/hooks/useDataLoader'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { sessionActions, SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { prop } from 'ramda'
import { mngmUserActions, mngmUserRoleAssignmentsLoader } from '../userManagement/users/actions'
import UserPasswordField from '../userManagement/users/UserPasswordField'
import DocumentMeta from 'core/components/DocumentMeta'
import Avatar from 'core/components/Avatar'
import { pathStr } from 'utils/fp'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'
import ApiClient from 'api-client/ApiClient'
import { useDispatch, useSelector } from 'react-redux'
import Progress from 'core/components/progress/Progress'
import { RootState } from 'app/store'
import { emailValidator } from 'core/utils/fieldValidators'
import useScopedPreferences from 'core/session/useScopedPreferences'

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
  tableHeader: {
    color: theme.palette.grey[500],
  },
  table: {
    width: 'inherit',
    margin: theme.spacing(0, 1, 2, 1),
    '& th.MuiTableCell-head': {
      borderBottom: `1px solid ${theme.palette.grey['700']}`,
    },
  },
}))

const { keystone, setActiveRegion } = ApiClient.getInstance()

const TenantsTable = ({ data }) => {
  const classes = useStyles()
  return (
    <Table className={classes.table} size="small" aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>
            <Text className={classes.tableHeader} variant="caption2">
              Tenant Name
            </Text>
          </TableCell>
          <TableCell>
            <Text className={classes.tableHeader} variant="caption2">
              Tenant Description
            </Text>
          </TableCell>
          <TableCell>
            <Text className={classes.tableHeader} variant="caption2">
              Role
            </Text>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((tenant) => (
          <TableRow key={tenant.id}>
            <TableCell>{tenant.name}</TableCell>
            <TableCell>{tenant.description}</TableCell>
            <TableCell>{tenant.roleName}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const MyProfilePage = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [prefs, updatePrefs] = useScopedPreferences()
  const [errorMessage, setErrorMessage] = useState('')
  const [oldUserPrefs, setOldUserPrefs] = useState(prefs)
  const userIdFormFieldSetter = useRef(null)

  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { userDetails } = session
  const { id: userId, displayName, email } = userDetails

  const [userTenants, loadingUserTenants] = useDataLoader(loadUserTenants)
  const [roleAssignments, loadingRoleAssignments] = useDataLoader(mngmUserRoleAssignmentsLoader, {
    userId,
  })
  const [update, updatingUser] = useDataUpdater(mngmUserActions.update)
  const userInfo = useMemo(
    () => ({
      id: userId,
      username: email,
      displayname: displayName || '',
      email,
      roleAssignments: roleAssignments.reduce(
        (acc, roleAssignment) => ({
          ...acc,
          [pathStr('scope.project.id', roleAssignment)]: pathStr('role.id', roleAssignment),
        }),
        {},
      ),
    }),
    [displayName, email, roleAssignments],
  )
  const tenantsAndRoles = useMemo(
    () =>
      userTenants.map((tenant) => {
        const userRoleAssignments = roleAssignments.find(
          (roleAssignment) => tenant.id === pathStr('scope.project.id', roleAssignment),
        )
        return {
          ...tenant,
          roleName: pathStr('role.name', userRoleAssignments),
        }
      }),
    [userTenants, roleAssignments],
  )
  const loadingSomething = loadingUserTenants || loadingRoleAssignments || updatingUser

  useEffect(() => {
    // Reset the initial values for the user ID form with the new updated values
    userIdFormFieldSetter.current.setField('email')(email)
    userIdFormFieldSetter.current.setField('displayName')(displayName)
  }, [displayName, email])

  useEffect(() => {
    // Whenever the user's email gets updated, transfer their old prefs over to the new email
    updatePrefs(oldUserPrefs)
    setActiveRegion(oldUserPrefs.currentRegion)
    setOldUserPrefs(prefs)
  }, [email])

  const setupUserIdFieldSetter = (setField) => {
    userIdFormFieldSetter.current = { setField }
  }

  const handleUserIdUpdate = async (values) => {
    const user = {
      ...userInfo,
      username: values.email || userInfo.email,
      displayname: values.displayname || userInfo.displayname,
    }

    const [updated, updatedUser] = await update(user)

    if (updated) {
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
    const { unscopedToken } = await keystone.authenticate(email, currentPassword, '')
    if (!unscopedToken) {
      setErrorMessage('Your current password is invalid.')
      return
    }

    if (newPassword !== confirmedPassword) {
      setErrorMessage('New passwords do not match.')
      return
    }

    const user = {
      ...userInfo,
      password: newPassword,
    }

    setErrorMessage('')
    await update(user)
  }

  return (
    <div className={classes.userProfile}>
      <DocumentMeta title="User Settings" bodyClasses={['form-view']} />
      <Progress
        message={updatingUser ? 'Updating user ...' : 'Loading user ...'}
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
                />
                <TextField className={classes.inputField} id="displayname" label="Display Name" />
                <SubmitButton className={classes.button}>Update</SubmitButton>
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
        <FormFieldCard className={classes.form} title="Tenants & Role Access">
          <TenantsTable data={tenantsAndRoles} />
        </FormFieldCard>
      </Progress>
    </div>
  )
}

export default MyProfilePage

import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import React, { useMemo, useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import TenantRolesTableField from 'account/components/userManagement/users/TenantRolesTableField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import {
  mngmUserActions,
  mngmUserRoleAssignmentsLoader,
} from 'account/components/userManagement/users/actions'
import { TextField as BaseTextField } from '@material-ui/core'
import { emptyObj, pathStr } from 'utils/fp'
import useReactRouter from 'use-react-router'
import FormWrapper from 'core/components/FormWrapper'
import { propEq } from 'ramda'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import UserPasswordField from 'account/components/userManagement/users/UserPasswordField'
import useToggler from 'core/hooks/useToggler'
import SimpleLink from 'core/components/SimpleLink'
import makeStyles from '@material-ui/styles/makeStyles'
import { requiredValidator } from 'core/utils/fieldValidators'
import Progress from 'core/components/progress/Progress'
import { routes } from 'core/utils/routes'
import { sessionActions, sessionStoreKey } from 'core/session/sessionReducers'
import { useDispatch, useSelector } from 'react-redux'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { prop } from 'ramda'
import ApiClient from 'api-client/ApiClient'

const listUrl = routes.userManagement.users.path()
const { setActiveRegion } = ApiClient.getInstance()

const useStyles = makeStyles((theme) => ({
  togglableFieldContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    '& .Mui-disabled': {
      color: theme.palette.text.primary,
    },
  },
  togglableField: {
    width: '50%',
  },
  togglableFieldBtn: {
    marginLeft: theme.spacing(2),
  },
}))

const TogglableTextField = ({
  id,
  label,
  initialValue,
  value,
  required = false,
  TextFieldComponent = TextField,
}) => {
  const classes = useStyles()
  const [showingField, toggleField] = useToggler()
  return (
    <div className={clsx('togglableFieldContainer', classes.togglableFieldContainer)}>
      {showingField ? (
        <TextFieldComponent id={id} label={label} value={value} required={required} />
      ) : (
        <BaseTextField
          className={classes.togglableField}
          label={label}
          value={initialValue}
          disabled
        />
      )}
      <SimpleLink className={classes.togglableFieldBtn} onClick={toggleField}>
        {showingField ? 'Cancel' : 'Change'}
      </SimpleLink>
    </div>
  )
}

const tenantRolesValidations = [requiredValidator.withMessage('Must select at least one tenant')]

const EditUserPage = () => {
  const { match, history } = useReactRouter()
  const dispatch = useDispatch()
  const userId = match.params.id
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const user = useMemo(() => users.find(propEq('id', userId)) || emptyObj, [users, userId])
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const [update, updating] = useDataUpdater(mngmUserActions.update)
  const [roleAssignments, loadingRoleAssignments] = useDataLoader(mngmUserRoleAssignmentsLoader, {
    userId,
  })

  const session = useSelector(prop(sessionStoreKey))
  const { userDetails } = session
  const { id: activeUserId, email: activeUserEmail } = userDetails
  const { prefs, updatePrefs } = useScopedPreferences()
  const [oldUserPrefs, setOldUserPrefs] = useState(prefs)
  const [activeUserUpdated, setActiveUserUpdated] = useState(false)

  const loadingSomething = loadingUsers || loadingTenants || loadingRoleAssignments || updating
  const isActiveUser = userId === activeUserId
  const showPasswordField = !isActiveUser

  const initialContext = useMemo(
    () => ({
      id: userId,
      username: user.username || user.email,
      displayname: user.displayname || '',
      roleAssignments: roleAssignments.reduce(
        (acc, roleAssignment) => ({
          ...acc,
          [pathStr('scope.project.id', roleAssignment)]: pathStr('role.id', roleAssignment),
        }),
        {},
      ),
    }),
    [user, roleAssignments],
  )

  useEffect(() => {
    // When the active user's email gets updated, transfer their old prefs over to the new email
    if (activeUserUpdated) {
      updatePrefs(oldUserPrefs)
      if (oldUserPrefs.currentRegion) {
        setActiveRegion(oldUserPrefs.currentRegion)
      }
      history.push(listUrl)
    }
  }, [activeUserEmail])

  const handleUserUpdate = async (values) => {
    const [updated, updatedUser] = await update(values)
    if (updated && isActiveUser) {
      setActiveUserUpdated(true)
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
    } else {
      history.push(listUrl)
    }
  }

  return (
    <FormWrapper
      title={`Edit User ${user.displayname || user.username || ''}`}
      loading={loadingSomething}
      renderContentOnMount={!loadingSomething}
      message={updating ? 'Submitting form...' : 'Loading User...'}
      backUrl={listUrl}
    >
      <Wizard onComplete={handleUserUpdate} context={initialContext}>
        {({ wizardContext, setWizardContext, onNext }) => (
          <>
            <WizardStep stepId="basic" label="Basic Info">
              <ValidatedForm
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                {({ values }) => (
                  <>
                    <TogglableTextField
                      id="username"
                      label="Username or Email"
                      initialValue={user.username}
                      required
                    />
                    <TogglableTextField
                      id="displayname"
                      label="Display Name"
                      initialValue={user.displayname}
                    />
                    {showPasswordField && (
                      <TogglableTextField
                        id="password"
                        label="Password"
                        initialValue={'********'}
                        value={values.password}
                        TextFieldComponent={UserPasswordField}
                      />
                    )}
                  </>
                )}
              </ValidatedForm>
            </WizardStep>
            <WizardStep stepId="tenants" label="Tenants and Roles">
              <ValidatedForm
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

export default EditUserPage

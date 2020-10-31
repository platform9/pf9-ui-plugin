import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import React, { useMemo, useCallback } from 'react'
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
import { pathJoin } from 'utils/misc'
import { userAccountPrefix } from 'app/constants'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import UserPasswordField from 'account/components/userManagement/users/UserPasswordField'
import useToggler from 'core/hooks/useToggler'
import SimpleLink from 'core/components/SimpleLink'
import makeStyles from '@material-ui/styles/makeStyles'
import { requiredValidator } from 'core/utils/fieldValidators'
import Progress from 'core/components/progress/Progress'

const listUrl = pathJoin(userAccountPrefix, 'user_management#users')

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
  const userId = match.params.id
  const onComplete = useCallback((success) => success && history.push(listUrl), [history])
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const user = useMemo(() => users.find(propEq('id', userId)) || emptyObj, [users, userId])
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const [update, updating] = useDataUpdater(mngmUserActions.update, onComplete)
  const [roleAssignments, loadingRoleAssignments] = useDataLoader(mngmUserRoleAssignmentsLoader, {
    userId,
  })
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
  const loadingSomething = loadingUsers || loadingTenants || loadingRoleAssignments || updating

  return (
    <FormWrapper
      title={`Edit User ${user.displayname || user.username || ''}`}
      loading={loadingSomething}
      renderContentOnMount={!loadingSomething}
      message={updating ? 'Submitting form...' : 'Loading User...'}
      backUrl={listUrl}
    >
      <Wizard onComplete={update} context={initialContext}>
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
                    <TogglableTextField
                      id="password"
                      label="Password"
                      initialValue={'********'}
                      value={values.password}
                      TextFieldComponent={UserPasswordField}
                    />
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

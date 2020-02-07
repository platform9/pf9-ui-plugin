import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import React, { useMemo, useCallback } from 'react'
import clsx from 'clsx'
import TenantRolesTableField from 'k8s/components/userManagement/users/TenantRolesTableField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useDataLoader from 'core/hooks/useDataLoader'
import {
  mngmUserActions,
  mngmUserRoleAssignmentsLoader,
} from 'k8s/components/userManagement/users/actions'
import { TextField as BaseTextField, Typography } from '@material-ui/core'
import { emptyObj, pathStr } from 'utils/fp'
import useReactRouter from 'use-react-router'
import FormWrapper from 'core/components/FormWrapper'
import { propEq } from 'ramda'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import UserPasswordField from 'k8s/components/userManagement/users/UserPasswordField'
import useToggler from 'core/hooks/useToggler'
import SimpleLink from 'core/components/SimpleLink'
import makeStyles from '@material-ui/styles/makeStyles'

const listUrl = pathJoin(k8sPrefix, 'user_management#users')

const useStyles = makeStyles((theme) => ({
  togglableField: {
    position: 'relative',
    '& .Mui-disabled': {
      color: theme.palette.text.primary,
    },
  },
  togglableFieldBtn: {
    position: 'absolute',
    top: 14,
    right: 0,
    width: 80,
    marginRight: -100,
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
    <div className={clsx('togglableField', classes.togglableField)}>
      {showingField ? (
        <TextFieldComponent id={id} label={label} value={value} required={required} />
      ) : (
        <BaseTextField label={label} value={initialValue} disabled />
      )}
      <SimpleLink className={classes.togglableFieldBtn} onClick={toggleField}>
        {showingField ? 'Cancel' : 'Change'}
      </SimpleLink>
    </div>
  )
}

const EditUserPage = () => {
  const { match, history } = useReactRouter()
  const userId = match.params.id
  const onComplete = useCallback((success) => success && history.push(listUrl), [history])
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const user = useMemo(() => users.find(propEq('id', userId)) || emptyObj, [users, userId])
  const [update, updating] = useDataUpdater(mngmUserActions.update, onComplete)
  const [roleAssignments, loadingRoleAssignments] = useDataLoader(mngmUserRoleAssignmentsLoader, {
    userId,
  })
  const initialContext = useMemo(
    () => ({
      id: userId,
      username: user.username || user.email,
      displayname: user.displayname || '',
      roleAssignments: roleAssignments.reduce((acc, roleAssignment) => {
        const roleId = pathStr('role.id', roleAssignment)
        const tenantId = pathStr('scope.project.id', roleAssignment)
        return {
          ...acc,
          [roleId]: acc[roleId] ? [...acc[roleId], tenantId] : [tenantId],
        }
      }, {}),
    }),
    [user, roleAssignments],
  )

  return (
    <FormWrapper
      title={`Edit User ${user.displayname || user.username || ''}`}
      loading={loadingUsers || loadingRoleAssignments || updating}
      renderContentOnMount={false}
      message={updating ? 'Submitting form...' : 'Loading User...'}
      backUrl={listUrl}
    >
      <Wizard onComplete={update} context={initialContext}>
        {({ wizardContext, setWizardContext, onNext }) => (
          <>
            <WizardStep stepId="basic" label="Basic Info">
              <ValidatedForm
                title="Basic Info"
                limitInputsWidth={false}
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
              <Typography variant="body1" component="p">
                Select one or more tenants that should map to this user.
              </Typography>
              <ValidatedForm
                title="Tenants and Roles"
                fullWidth
                limitInputsWidth={false}
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                <TenantRolesTableField required id="roleAssignments" />
              </ValidatedForm>
            </WizardStep>
          </>
        )}
      </Wizard>
    </FormWrapper>
  )
}

export default EditUserPage

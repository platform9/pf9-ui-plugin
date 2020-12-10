import { makeStyles, Theme } from '@material-ui/core'
import clsx from 'clsx'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Text from 'core/elements/text'
import React from 'react'
import UserPasswordField from '../userManagement/users/UserPasswordField'

const useStyles = makeStyles((theme: Theme) => ({
  userDetails: {
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
  },
  fieldName: {
    alignSelf: 'center',
  },
  inputField: {
    width: '100% !important',
  },
  button: {
    gridColumn: '2',
    marginTop: theme.spacing(2),
  },
  confirmPasswordField: {
    gridColumn: '2',
  },
}))

const MyProfilePage = () => {
  const classes = useStyles()

  return (
    <FormFieldCard title="User Details">
      <ValidatedForm fullWidth>
        <div className={classes.userDetails}>
          <Text className={classes.fieldName} variant="subtitle2">
            Username
          </Text>
          <TextField className={classes.inputField} id="username" label="Username" />
          <Text className={classes.fieldName} variant="subtitle2">
            Display Name
          </Text>
          <TextField className={classes.inputField} id="displayName" label="Display Name" />
          <SubmitButton className={classes.button}>+ Save User Details</SubmitButton>
        </div>
      </ValidatedForm>
      <ValidatedForm fullWidth>
        {({ values }) => (
          <div className={classes.userDetails}>
            <Text variant="subtitle2">Update Password</Text>
            {/* <TextField className={classes.inputField} id="newPassword" label="New Password" /> */}
            <div>
              <UserPasswordField
                className={classes.inputField}
                label="New Password"
                value={values.newPassword}
              />
            </div>

            <UserPasswordField
              className={clsx(classes.confirmPasswordField, classes.inputField)}
              label="Confirm Password"
              value={values.confirmPassword}
              showPasswordRequirements={false}
            />
            <SubmitButton className={classes.button}>+ Update Password</SubmitButton>
          </div>
        )}
      </ValidatedForm>
    </FormFieldCard>
  )
}

export default MyProfilePage

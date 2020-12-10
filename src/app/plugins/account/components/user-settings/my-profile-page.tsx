import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
} from '@material-ui/core'
import clsx from 'clsx'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Text from 'core/elements/text'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadUserTenants } from 'openstack/components/tenants/actions'
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
  tableHeader: {
    color: theme.palette.grey[500],
  },
  table: {
    width: 'inherit',
    // '& tr:last-child': {
    //   border: 'none',
    //   '& td': {
    //     border: 'none',
    //   },
    // },
    // border: 'none',
    // borderColor: ({ hasError }) =>
    //   hasError ? theme.components.error.main : theme.palette.text.disabled,
    // '& th.MuiTableCell-head': {
    //   border: 'none',
    // },
  },
}))

// const TenantsTable = ({ tenants }) => {
//   const classes = useStyles()
//   return (
//     <table>
//       <thead>
//         <tr>
//           <th className={classes.tableHeader}>Tenant Name</th>
//           <th className={classes.tableHeader}>Tenant Description</th>
//         </tr>
//       </thead>
//       <tbody>
//         {tenants.map((tenant) => (
//           <tr>
//             <td>{tenant.name}</td>
//             <td>{tenant.description}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   )
// }

const TenantsTable = ({ tenants }) => {
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
        </TableRow>
      </TableHead>
      <TableBody>
        {tenants.map((tenant) => (
          <TableRow>
            <TableCell>{tenant.name}</TableCell>
            <TableCell>{tenant.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const MyProfilePage = () => {
  const classes = useStyles()
  const [userTenants] = useDataLoader(loadUserTenants)
  console.log('userTenants', userTenants)

  return (
    <>
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
      <FormFieldCard title="Roles & Tenant Access">
        <TenantsTable tenants={userTenants} />
      </FormFieldCard>
    </>
  )
}

export default MyProfilePage

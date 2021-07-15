import Theme from 'core/themes/model'
import { makeStyles, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import React, { useMemo } from 'react'
import Text from 'core/elements/text'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { mngmUserRoleAssignmentsLoader } from '../userManagement/users/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { pathStr } from 'utils/fp'

const useStyles = makeStyles((theme: Theme) => ({
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

const TenantsAndRoleAccessTable = ({ userId }) => {
  const classes = useStyles()
  const [userTenants, loadingUserTenants] = useDataLoader(loadUserTenants)
  const [roleAssignments, loadingRoleAssignments] = useDataLoader(mngmUserRoleAssignmentsLoader, {
    userId,
  })

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

  if (loadingUserTenants || loadingRoleAssignments) {
    return null
  }

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
        {tenantsAndRoles.map((tenant) => (
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

export default TenantsAndRoleAccessTable

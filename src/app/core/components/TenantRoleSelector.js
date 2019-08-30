import React from 'react'
import { FormControl, MenuItem, Select, TableCell, TableRow } from '@material-ui/core'

class TenantRoleSelector extends React.PureComponent {
  render () {
    const { tenant, roles, status, handleChange } = this.props
    return (
      <TableRow key={tenant.id} >
        <TableCell>{tenant.name}</TableCell>
        <TableCell>
          <FormControl>
            <Select
              value={status[tenant.name] || 'None'}
              onChange={handleChange(tenant)}
              inputProps={{
                id: tenant.id
              }}
            >
              {roles.map(role =>
                <MenuItem
                  value={role}
                  key={role}
                >
                  {role}
                </MenuItem>)}
            </Select>
          </FormControl>
        </TableCell>
      </TableRow>
    )
  }
}

export default TenantRoleSelector

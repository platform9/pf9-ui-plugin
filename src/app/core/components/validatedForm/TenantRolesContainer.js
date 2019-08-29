import React, { useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import TenantRoleSelector from 'core/components/TenantRoleSelector'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import tenantActions from 'openstack/components/tenants/actions'
import Progress from 'core/components/progress/Progress'

// TODO revise and improve this component
const TenantRolesContainer = ({ value, setFieldValue, id, roles }) => {
  const [tenants, loadingTenants] = useDataLoader(tenantActions.list)

  const combineRoles = (curTenant, role) => {
    inputTenants[curTenant.name] = role
    return Object.entries(inputTenants)
      .filter(([tenant, role]) => role !== 'None')
      .reduce((acc, [tenant, role]) => {
        acc.push(JSON.stringify({ tenant, role }))
        return acc
      }, [])
  }

  // Sample of rolepair:
  // ["{tenant: 'service', role: 'admin'}"] -> { service: 'admin' }
  const inputTenants = useMemo(() => {
    if (!value) return {}
    return value.map(JSON.parse).reduce((acc, cur) => {
      acc[cur.tenant] = cur.role
      return acc
    }, {})
  }, [value])

  const handleChange = curTenant => event => {
    setFieldValue(combineRoles(curTenant, event.target.value))
  }
  if (!value) {
    return null
  }
  return (<Progress loading={loadingTenants} overlay>
    <Table id={id}>
      <TableHead>
        <TableRow>
          <TableCell>Tenants</TableCell>
          <TableCell>Roles</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tenants.map(tenant =>
          <TenantRoleSelector
            key={tenant.id}
            tenant={tenant}
            roles={roles}
            status={inputTenants}
            handleChange={handleChange(tenant)}
          />)
        }
      </TableBody>
    </Table>
  </Progress>)
}

TenantRolesContainer.propTypes = {
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withInfoTooltip, // This HoC causes unnecessary re-renders if declared after withFormContext
)(TenantRolesContainer)

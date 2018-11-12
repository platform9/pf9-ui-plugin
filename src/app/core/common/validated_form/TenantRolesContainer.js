import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core'
import TenantRoleSelector from 'core/common/TenantRoleSelector'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/common/validated_form/withFormContext'
import { compose } from 'core/fp'
import { withInfoTooltip } from 'app/core/common/InfoTooltip'

class TenantRolesContainer extends React.Component {
  static defaultProps = {
    tenants: []
  }

  handleChange = curTenant => async event => {
    const { setFieldValue } = this.props
    setFieldValue(await this.combineRoles(curTenant, event.target.value))
  }

  // Sample of rolepair:
  // ["{tenant: 'service', role: 'admin'}"] -> { service: 'admin' }
  parseInput = () => {
    const { rolePair } = this.props.value
    if (!rolePair) return {}
    return rolePair.map(JSON.parse).reduce((acc, cur) => {
      acc[cur.tenant] = cur.role
      return acc
    }, {})
  }

  combineRoles = (curTenant, role) => {
    let result = this.parseInput()
    result[curTenant.name] = role
    return Object.entries(result)
      .filter(([ tenant, role ]) => role !== 'None')
      .reduce((acc, [ tenant, role ]) => {
        acc.push(JSON.stringify({ tenant, role }))
        return acc
      }, [])
  }

  render () {
    const { id, tenants, roles } = this.props
    const inputTenants = this.parseInput()
    return (
      inputTenants && <div id={id}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenants</TableCell>
              <TableCell>Roles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map(tenant => {
              return (
                <TenantRoleSelector
                  key={tenant.id}
                  tenant={tenant}
                  roles={roles}
                  status={inputTenants}
                  handleChange={this.handleChange}
                />
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }
}

TenantRolesContainer.propTypes = {
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
  withInfoTooltip,
)(TenantRolesContainer)

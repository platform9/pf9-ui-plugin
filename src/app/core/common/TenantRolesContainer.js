import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core'
import { pickMultiple } from 'core/fp'
import { withFormContext } from 'core/common/ValidatedForm'
import TenantRoleSelector from 'core/common/TenantRoleSelector'

class TenantRolesContainer extends React.Component {
  constructor (props) {
    super(props)
    const spec = pickMultiple('validations')(props)
    props.defineField(props.id, spec)
  }

  static defaultProps = {
    tenants: []
  }

  handleChange = curTenant => async event => {
    const { id, setField } = this.props
    setField(id, await this.combineRoles(curTenant, event.target.value))
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

export default withFormContext(TenantRolesContainer)

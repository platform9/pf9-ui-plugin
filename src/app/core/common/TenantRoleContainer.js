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

class TenantRoleContainer extends React.Component {
  constructor (props) {
    super(props)
    const spec = pickMultiple('validations')(props)
    props.defineField(props.id, spec)
  }

  handleChange = curTenant => async event => {
    const { id, setField } = this.props
    setField(id, await this.combineRoles(curTenant, event.target.value))
  }
  // Sample of rolepair:
  // input(array of strings):
  // ["{tenant: 'test tenant', role: 'admin'}", "{tenant: 'test tenant2', role: 'user'}"]
  // output(array of JSON objects):
  // [{
  //   tenant: 'test tenant',
  //   role: 'admin'
  // },{
  //   tenant: 'test tenant2',
  //   role: 'user'
  // }]
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
      .filter(entry => entry[1] !== 'None')
      .reduce((acc, cur) => {
        acc.push(JSON.stringify({
          tenant: cur[0],
          role: cur[1]
        }))
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

export default withFormContext(TenantRoleContainer)

import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'react-apollo'
import { FormControl, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import { pickMultiple } from 'core/fp'
import { withFormContext } from 'core/common/ValidatedForm'

const styles = theme => ({
  table: {
    minWidth: 700,
  }
})

class TenantRoleSelector extends React.Component {
  constructor (props) {
    super(props)
    const spec = pickMultiple('validations')(props)
    props.defineField(props.id, spec)
  }

  handleChange = curTenant => async event => {
    const { id, setField } = this.props
    setField(id, await this.combineRoles(curTenant, event.target.value))
  }

  parseInput = () => {
    const { rolePair } = this.props.value
    if (!rolePair) return {}
    let result = rolePair.reduce((acc, cur) => {
      cur = JSON.parse(cur)
      acc[cur.tenant] = cur.role
      return acc
    }, {})
    return result
  }

  combineRoles = (curTenant, role) => {
    let result = this.parseInput()
    if (role === 'None') {
      if (result[curTenant.name]) delete result[curTenant.name]
    } else {
      result[curTenant.name] = role
    }
    return Object.entries(result).reduce((acc, cur) => {
      acc.push(JSON.stringify({
        tenant: cur[0],
        role: cur[1]
      }))
      return acc
    }, [])
  }

  render () {
    const { id, classes, tenants } = this.props
    const inputTenants = this.parseInput()
    return (
      inputTenants && <div id={id}>
        <Table
          className={classes.table}
        >
          <TableHead>
            <TableRow>
              <TableCell>Tenants</TableCell>
              <TableCell>Roles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map(tenant => {
              return (
                <TableRow key={tenant.id} >
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>
                    <FormControl className={classes.formControl} >
                      <Select
                        value={inputTenants[tenant.name] || 'None'}
                        onChange={this.handleChange(tenant)}
                        inputProps={{
                          id: tenant.id
                        }}
                      >
                        <MenuItem value={'None'}>None</MenuItem>
                        <MenuItem value={'Role1'}>Role1</MenuItem>
                        <MenuItem value={'Role2'}>Role2</MenuItem>
                        <MenuItem value={'Role3'}>Role3</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }
}

export default compose(
  withStyles(styles),
  withFormContext
)(TenantRoleSelector)

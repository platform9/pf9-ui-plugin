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
    this.state = {
      ...this.parseInput()
    }
  }

  handleChange = curTenant => async event => {
    const { id, setField } = this.props
    await this.setState({
      [curTenant.name]: event.target.value
    })
    setField(id, this.combineRoles())
  }

  parseInput = () => {
    const { currentPairs } = this.props
    if (!currentPairs) return
    return currentPairs.reduce((acc, cur) => {
      acc[cur.tenant] = cur.role
      return acc
    }, {})
  }

  combineRoles = () => {
    const { tenants } = this.props
    return tenants.reduce((acc, cur) => {
      if (this.state[cur.name] && this.state[cur.name] !== 'None') {
        acc.push(JSON.stringify({
          tenant: cur.name,
          role: this.state[cur.name]
        }))
      }
      return acc
    }, [])
  }

  render () {
    const { id, classes, tenants } = this.props
    return (
      <div id={id}>
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
                        value={this.state[tenant.name] || 'None'}
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

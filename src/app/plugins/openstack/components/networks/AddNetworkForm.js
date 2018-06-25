import React from 'react'
import PropTypes from 'prop-types'
import { Button, Checkbox, FormControl, TextField } from '@material-ui/core'

class AddNetworkForm extends React.Component {
  state = {
    name: '',
    subnets: '',
    tenant: '',
    shared: false,
    port_security_enabled: false,
    external: false,
    admin_state_up: false,
    status: ''
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  setCheckbox = field => event => this.setState({ [field]: event.target.checked })

  fields = [
    { id: 'name', label: 'Name' },
    { id: 'subnets', label: 'Subnets Associated' },
    { id: 'tenant', label: 'Tenant' },
    { id: 'shared', label: 'Shared', type: 'checkbox' },
    { id: 'port_security_enabled', label: 'Port Security', type: 'checkbox' },
    { id: 'external', label: 'External Network', type: 'checkbox' },
    { id: 'admin_state_up', label: 'Admin State', type: 'checkbox' },
    { id: 'status', label: 'Status' },
  ]

  renderField = ({ id, label, type = 'text' }) => {
    if (type === 'text') {
      return (
        <div key={id}>
          <TextField id={id} type={type} label={label} value={this.state[id]} onChange={this.setField(id)} />
        </div>
      )
    } else if (type === 'checkbox') {
      return (
        <div key={id}>
          <FormControl>{label}</FormControl>
          <Checkbox checked={this.state[id]} onChange={this.setCheckbox(id)} value={id} />
        </div>
      )
    }
  }

  handleSubmit = event => {
    event.preventDefault()
    this.props.onSubmit(this.state)
  }

  render () {
    return (
      <form noValidate onSubmit={this.handleSubmit}>
        {this.fields.map(this.renderField)}
        <Button variant="raised" type="submit">Submit</Button>
      </form>
    )
  }
}

AddNetworkForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddNetworkForm

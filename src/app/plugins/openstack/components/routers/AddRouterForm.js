import React from 'react'
import PropTypes from 'prop-types'
import { Button, Checkbox, FormControl, TextField } from '@material-ui/core'

class AddRouterForm extends React.Component {
  state = {
    name: '',
    tenant_id: '',
    admin_state_up: false,
    status: ''
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  setCheckbox = field => event => this.setState({ [field]: event.target.checked })

  fields = [
    { id: 'name', label: 'Name' },
    { id: 'tenant_id', label: 'Tenant ID' },
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

AddRouterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddRouterForm

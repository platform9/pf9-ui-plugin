import React from 'react'
import PropTypes from 'prop-types'
import { Button, Checkbox, FormControl, TextField } from '@material-ui/core'

class UpdateRouterForm extends React.Component {
  state = {
    name: this.props.router.name || '',
    admin_state_up: this.props.router.admin_state_up || false,
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  setCheckbox = field => event => this.setState({ [field]: event.target.checked })

  fields = [
    { id: 'name', label: 'Name' },
    { id: 'admin_state_up', label: 'Admin State', type: 'checkbox' },
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
      <form onSubmit={this.handleSubmit}>
        {this.fields.map(this.renderField)}
        <Button variant="raised" type="submit">Submit</Button>
      </form>
    )
  }
}

UpdateRouterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default UpdateRouterForm

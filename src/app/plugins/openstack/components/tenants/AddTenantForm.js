import React from 'react'
import PropTypes from 'prop-types'
import { Button, TextField } from '@material-ui/core'

class AddTenantForm extends React.Component {
  state = {
    name: '',
    description: '',
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  fields = [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
  ]

  renderField = ({ id, label, type = 'text' }) => {
    if (type === 'text' || type === 'password') {
      return (
        <div key={id}>
          <TextField id={id} type={type} label={label} value={this.state[id]} onChange={this.setField(id)} />
        </div>
      )
    }
  }

  handleSubmit = () => {
    this.props.onSubmit(this.state)
  }

  render () {
    return (
      <form noValidate>
        {this.fields.map(this.renderField)}
        <div>
          <Button variant="raised" onClick={this.handleSubmit}>Add Tenant</Button>
        </div>
      </form>
    )
  }
}

AddTenantForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddTenantForm

import React from 'react'
import PropTypes from 'prop-types'
import NoAutofillHack from 'core/common/NoAutofillHack'
import { Button, TextField } from '@material-ui/core'

class UpdateUserForm extends React.Component {
  state = {
    name: this.props.user.name || '',
    email: this.props.user.email || '',
    username: this.props.user.username || '',
    displayname: this.props.user.displayname || '',
    password: '',
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  fields = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'username', label: 'Username' },
    { id: 'displayname', label: 'Display Name' },
    { id: 'password', label: 'Password', type: 'password' },
  ]

  renderField = ({ id, label, type = 'text' }) => {
    if (type === 'text' || type === 'password') {
      return (
        <div key={id}>
          <TextField id={id} type={type} label={label} value={this.state[id]} onChange={this.setField(id)} autoComplete="new-password" />
        </div>
      )
    }
  }

  handleSubmit = () => {
    this.props.onSubmit(this.state)
  }

  // As of Chrome 66, Google has disabled the NoAutofillHack and still does
  // not respect the HTML spec for autocomplete="off".  After some experimentation
  // it looks like autocomplete="new-password" works.
  render () {
    return (
      <form noValidate autoComplete="new-password">
        <NoAutofillHack />
        {this.fields.map(this.renderField)}
        <div>
          <Button variant="raised" onClick={this.handleSubmit}>Submit</Button>
        </div>
      </form>
    )
  }
}

UpdateUserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default UpdateUserForm

import React from 'react'
import PropTypes from 'prop-types'
import NoAutofillHack from 'core/common/NoAutofillHack'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'

class AddUserForm extends React.Component {
  state = {
    name: '',
    email: '',
    username: '',
    displayname: '',
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
          <TextField id={id} type={type} label={label} value={this.state[id]} onChange={this.setField(id)} autoComplete="off" />
        </div>
      )
    }
  }

  handleSubmit = () => {
    this.props.onSubmit(this.state)
  }

  // As of Chrome 66, Google has disabled the NoAutofillHack and still does
  // not respect the HTML spec for disabling autocomplete.  It does not
  // look like there is anything we can do to prevent Chrome from autofilling
  // the admin's username and password for new users.
  //
  // I added the autoComplete attributes in hopes that some day Google will
  // respect the spec.
  render () {
    return (
      <form noValidate autoComplete="off">
        <NoAutofillHack />
        {this.fields.map(this.renderField)}
        <div>
          <Button variant="raised" onClick={this.handleSubmit}>Submit</Button>
        </div>
      </form>
    )
  }
}

AddUserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddUserForm

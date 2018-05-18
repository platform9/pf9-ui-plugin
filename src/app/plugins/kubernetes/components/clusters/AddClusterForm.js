import React from 'react'
import PropTypes from 'prop-types'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'

class AddClusterForm extends React.Component {
  state = {
    name: '',
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  fields = [
    { id: 'name', label: 'Name' },
  ]

  renderField = ({ id, label, type = 'text' }) => {
    if (type === 'text' || type === 'number') {
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
          <Button variant="raised" onClick={this.handleSubmit}>Submit</Button>
        </div>
      </form>
    )
  }
}

AddClusterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddClusterForm

import React from 'react'
import PropTypes from 'prop-types'
import { Button, TextField } from '@material-ui/core'

class UpdateFlavorForm extends React.Component {
  state = {
    name: this.props.flavor.name || '',
    tags: this.props.flavor.tags || ''
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  fields = [
    { id: 'name', label: 'Name', disabled: true },
    { id: 'tags', label: 'Tags', disabled: false }
  ]

  renderField = ({ id, label, type = 'text', disabled = false }) => {
    if (type === 'text') {
      return (
        <div key={id}>
          <TextField id={id} type={type} label={label} value={this.state[id]} onChange={this.setField(id)} disabled={disabled} />
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

UpdateFlavorForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default UpdateFlavorForm

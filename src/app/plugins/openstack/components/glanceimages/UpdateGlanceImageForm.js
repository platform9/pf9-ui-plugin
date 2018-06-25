import React from 'react'
import PropTypes from 'prop-types'
import { Button, Checkbox, FormControl, TextField } from '@material-ui/core'

class UpdateGlanceImageForm extends React.Component {
  state = {
    name: this.props.glanceImage.name || '',
    description: this.props.glanceImage.description || '',
    owner: this.props.glanceImage.owner || '',
    visibility: this.props.glanceImage.visibility || '',
    protected: this.props.glanceImage.protected || false,
    tags: this.props.glanceImage.tags || ''
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  setCheckbox = field => event => this.setState({ [field]: event.target.checked })

  fields = [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'owner', label: 'Tenant' },
    { id: 'visibility', label: 'Visibility' },
    { id: 'protected', label: 'Protected', type: 'checkbox' },
    { id: 'tags', label: 'Tags' }
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
          <FormControl>
            {label}
          </FormControl>
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

UpdateGlanceImageForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default UpdateGlanceImageForm

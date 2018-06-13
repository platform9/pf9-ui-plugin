import React from 'react'
import PropTypes from 'prop-types'
import { Button, Checkbox, FormControl, TextField } from '@material-ui/core'

class UpdateVolumeForm extends React.Component {
  state = {
    name: this.props.volume.name || '',
    description: this.props.volume.description || '',
    bootable: this.props.volume.bootable || false
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  setCheckbox = field => event => this.setState({ [field]: event.target.checked })

  fields = [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'bootable', label: 'Bootable', type: 'checkbox' }
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
          <Checkbox checked={this.state[id]} onChange={this.setCheckbox(id)} value="bootable" />
        </div>
      )
    }
  }

  handleSubmit = () => {
    this.props.onSubmit(this.state)
  }

  render () {
    return (
      <form>
        {this.fields.map(this.renderField)}
        <div>
          <Button variant="raised" onClick={this.handleSubmit}>Submit</Button>
        </div>
      </form>
    )
  }
}

UpdateVolumeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default UpdateVolumeForm

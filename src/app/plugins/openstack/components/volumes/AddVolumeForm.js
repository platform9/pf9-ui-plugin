import React from 'react'
import PropTypes from 'prop-types'
import { Button, Checkbox, FormControl, TextField } from '@material-ui/core'

class AddVolumeForm extends React.Component {
  state = {
    name: '',
    description: '',
    volume_type: '',
    status: '',
    tenant: '',
    host: '',
    instance: '',
    device: '',
    size: 0,
    bootable: false,
    attachedMode: '',
    source: '',
    readonly: false,
    metadata: ''
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  setCheckbox = field => event => this.setState({ [field]: event.target.checked })

  fields = [
    { id: 'name', label: 'Volume Name' },
    { id: 'volume_type', label: 'Volume Type' },
    { id: 'description', label: 'Description' },
    { id: 'status', label: 'Status' },
    { id: 'tenant', label: 'Tenant' },
    { id: 'source', label: 'Source' },
    { id: 'host', label: 'Host' },
    { id: 'instance', label: 'Instance' },
    { id: 'device', label: 'Device' },
    { id: 'size', label: 'Capacity', type: 'number' },
    { id: 'bootable', label: 'Bootable', type: 'checkbox' },
    { id: 'attachedMode', label: 'attached_mode' },
    { id: 'readonly', label: 'readonly', type: 'checkbox' },
    { id: 'metadata', label: 'Metadata' }
  ]

  renderField = ({ id, label, type = 'text' }) => {
    if (type === 'text' || type === 'number') {
      return (
        <div key={id}>
          <TextField id={id} type={type} label={label} value={this.state[id]} onChange={this.setField(id)} />
        </div>
      )
    } else {
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
      <form noValidate>
        {this.fields.map(this.renderField)}
        <div>
          <Button variant="raised" onClick={this.handleSubmit}>Submit</Button>
        </div>
      </form>
    )
  }
}

AddVolumeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddVolumeForm

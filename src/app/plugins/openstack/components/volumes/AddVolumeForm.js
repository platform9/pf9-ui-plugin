import React from 'react'
import PropTypes from 'prop-types'
import { Button, TextField } from '@material-ui/core'

class AddVolumeForm extends React.Component {
  state = {
    name: '',
    description: '',
    type: '',
    size: 0,
    sizeUnit: 'GB',
    bootable: false,
    source: '',
    metadata: [],
    created: new Date().toISOString(),
  }

  setField = field => event => this.setState({ [field]: event.target.value })

  fields = [
    { id: 'name', label: 'Volume Name' },
    { id: 'type', label: 'Volume Type' },
    { id: 'description', label: 'Description' },
    { id: 'status', label: 'Status' },
    { id: 'tenant', label: 'Tenant' },
    { id: 'source', label: 'Source' },
    { id: 'host', label: 'Host' },
    { id: 'instance', label: 'Instance' },
    { id: 'device', label: 'Device' },
    { id: 'size', label: 'Capacity', type: 'number' },
    { id: 'bootable', label: 'Bootable' },
    { id: 'created', label: 'Created' },
    { id: 'id', label: 'OpenStack ID' },
    { id: 'attachedMode', label: 'attached_mode' },
    { id: 'readonly', label: 'readonly' },
    { id: 'metadata', label: 'Metadata' }
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

AddVolumeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddVolumeForm

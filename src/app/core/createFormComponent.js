import React from 'react'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const createFormComponent = ({ submitLabel, initialValue, displayName, fields }) => {
  const mapField = spec => {
    const props = {
      ...spec,
      key:  spec.id,
      type: spec.type || 'string',
    }
    if (props.type === 'string' || props.type === 'number') { return <TextField {...props} /> }
  }

  const Form = ({ onComplete }) => (
    <ValidatedForm onSubmit={onComplete} initialValue={initialValue}>
      {fields.map(mapField)}
      <SubmitButton>{submitLabel}</SubmitButton>
    </ValidatedForm>
  )
  Form.displayName = displayName
  return Form
}

export default createFormComponent

import React from 'react'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'
import Checkbox from 'core/common/validated_form/Checkbox'

const createFormComponent = ({ submitLabel, initialValue, displayName, fields }) => {
  const mapField = spec => {
    const props = {
      ...spec,
      key:  spec.id,
      type: spec.type || 'string',
    }
    if (props.type === 'string' || props.type === 'number') { return <TextField {...props} /> }
    if (props.type === 'boolean') { return <Checkbox {...props} /> }
  }

  const Form = ({ onComplete }) => (
    <ValidatedForm onSubmit={onComplete} initialValues={initialValue}>
      {fields.map(mapField)}
      <SubmitButton>{submitLabel}</SubmitButton>
    </ValidatedForm>
  )
  Form.displayName = displayName
  return Form
}

export default createFormComponent

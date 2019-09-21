import React, { forwardRef } from 'react'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import Checkbox from 'core/components/validatedForm/CheckboxField'

const createFormComponent = ({ submitLabel, initialValue, displayName, fields }) => {
  const mapField = spec => {
    const props = {
      ...spec,
      key: spec.id,
      type: spec.type || 'string',
    }
    if (props.type === 'string' || props.type === 'number') { return <TextField {...props} /> }
    if (props.type === 'boolean') { return <Checkbox {...props} /> }
  }

  // We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
  const Form = forwardRef(({ onComplete }, ref) => (
    <ValidatedForm ref={ref} onSubmit={onComplete} initialValues={initialValue}>
      {fields.map(mapField)}
      <SubmitButton>{submitLabel}</SubmitButton>
    </ValidatedForm>
  ))
  Form.displayName = displayName
  return Form
}

export default createFormComponent

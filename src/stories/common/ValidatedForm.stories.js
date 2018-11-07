import React from 'react'
import { addStories, jsonDetailLogger } from '../helpers'

import ValidatedForm, { FormInfoPlaceholder } from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import {
  customValidator,
  matchFieldValidator,
  requiredValidator
} from 'core/FieldValidator'
import Checkbox from 'core/common/Checkbox'

const renderForm = (props = {}) => () => (
  <ValidatedForm onSubmit={jsonDetailLogger('ValidatedForm#submit')} {...props}>
    <div style={{display: 'flex', flexFlow: 'row nowrap', alignItems: 'center'}}>
      <div style={{display: 'flex', flexFlow: 'column nowrap', minWidth: '50%', paddingRight: '1rem'}}>
        <TextField
          id="name"
          placeholder="Name"
          label="Name"
          info="Some description here"
          validations={{
            required: true,
            length: {
              params: [3, 10],
              message: 'Name must contain between 3 and 10 characters'
            }
          }}
        />
        <TextField
          id="password"
          placeholder="Password"
          label="Password"
          info="Set the password"
          validations={{
            required: true,
            minLength: [4]
          }}
        />
        <TextField
          id="password_repeat"
          placeholder="Repeat password"
          label="Repeat password"
          validations={[
            requiredValidator,
            matchFieldValidator('password').withMessage('Passwords do not match')
          ]}
        />
        <br />
        <TextField
          id="description"
          info="Lorem ipsum dolor sit amet consectetur adipiscing elit purus dignissim, nam ornare tellus class natoque nullam fames nec, in sed fermentum odio curae inceptos enim etiam. A cubilia lectus penatibus scelerisque et neque leo vestibulum, morbi hendrerit at ultricies erat fames est magna pellentesque, duis gravida donec dictumst sociis tortor tempor. Magna ac id vitae gravida dictumst non quis fusce, ornare sodales enim porttitor erat tellus convallis, proin fermentum mattis facilisi mauris fames dui."
          placeholder="Description"
          validations={[
            customValidator(
              value => /[0-9]+/.test(value),
              (value, formFields, fieldKey) =>
                `This is a custom validator that fails when text does not contain a number.` +
              `The current value of field '${fieldKey}' is ${value}.` +
              `From here we have access to other form fields as well, like 'name' with value ${
                formFields['name']
              }`
            )
          ]}
        />
        <Checkbox
          id="accept_terms"
          label="Accept terms"
          info="Conditions text"
          validations={{ required: { message: 'You must accept the terms' } }}
        />
        <button type="submit">Submit</button>

      </div>
      <FormInfoPlaceholder />
    </div>
  </ValidatedForm>
)

addStories('Form Handling/ValidatedForm', {
  'Without any fields': () => (
    <ValidatedForm onSubmit={jsonDetailLogger('ValidatedForm#submit')}>
      <button type="submit">submit</button>
    </ValidatedForm>
  ),

  'Render arbitrary children': () => (
    <ValidatedForm onSubmit={jsonDetailLogger('ValidatedForm#submit')}>
      <div>
        <h1>Any valid JSX works within ValidatedForm</h1>
        <p>I do what I want</p>
      </div>
      <button type="submit">submit</button>
    </ValidatedForm>
  ),

  'Field state gets propagated up': () => (
    <ValidatedForm
      onSubmit={jsonDetailLogger('ValidatedForm#submit')}
      initialValue={{ name: 'existing name' }}
    >
      <TextField id="name" placeholder="Name" label="Name" />
      <br />
      <TextField id="description" placeholder="Description" />
      <button type="submit">Submit</button>
    </ValidatedForm>
  ),

  'Fields validation on blur and on submit': renderForm({
    showErrorsOnBlur: true
  }),

  'Fields validation just on submit': renderForm()
})

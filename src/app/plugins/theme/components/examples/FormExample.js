import React from 'react'
import Panel from '../Panel'

import Checkbox from 'core/components/validatedForm/CheckboxField'
import FormWrapper from 'core/components/FormWrapper'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'

import { customValidator } from 'core/utils/fieldValidators'

const nop = () => {}

const FormExample = ({ expanded = false }) => (
  <Panel title="Form" defaultExpanded={expanded}>
    <FormWrapper title="Add Entity" backUrl=''>
      <ValidatedForm onSubmit={nop}>
        <TextField
          id="name"
          placeholder="Name"
          label="Name"
          info="Enter your full name"
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
          type="password"
          validations={{
            required: true,
            minLength: [4]
          }}
        />
        <PicklistField
          id="items"
          label="List of items"
          options={[{
            label: 'Item 1',
            value: 'item_1',
          }, {
            label: 'Item 2',
            value: 'item_2',
          }, {
            label: 'Item 3',
            value: 'item_3',
          }]}
          info="List of items"
        />
        <KeyValuesField
          id="labels"
          label="Labels"
          initialValue={[{ key: 'network', value: 'local' }]}
        />
        <TextField
          id="description"
          info="Lorem ipsum dolor sit amet consectetur adipiscing elit purus dignissim, nam ornare tellus class natoque nullam fames nec, in sed fermentum odio curae inceptos enim etiam. "
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
        <SubmitButton>Add Entity</SubmitButton>
      </ValidatedForm>
    </FormWrapper>
  </Panel>
)

export default FormExample

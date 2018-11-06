import moize from 'moize'
import { isNil } from 'ramda'

export default class FieldValidator {
  /**
   * @param validationFn Function
   * @param errorMessage String
   */
  constructor (validationFn, errorMessage) {
    this.validate = validationFn
    this.errorMessage = errorMessage
  }

  withMessage = moize(message => new FieldValidator(this.validate, message))
}

// Create a custom inline validator (alternative to 'new FieldValidator')
export const customValidator = (validator, errorMessage) =>
  new FieldValidator(validator, errorMessage)

export const emailValidator = new FieldValidator(
  email =>
    !email ||
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(
      email
    ),
  'Email is invalid'
)

export const requiredValidator = new FieldValidator(
  value => !isNil(value) && value !== '',
  'Field is required'
)

export const matchFieldValidator = moize(
  id =>
    new FieldValidator(
      (value, formFields) => value === formFields[id],
      'Fields do not match'
    )
)

export const lengthValidator = moize(
  (minLength, maxLength) =>
    new FieldValidator(
      value =>
        !value ||
        (value.toString().length >= minLength &&
          value.toString().length <= maxLength),
      `Length must be between ${minLength} and ${maxLength}`
    )
)

export const minLengthValidator = moize(
  minLength =>
    new FieldValidator(
      value => !value || value.toString().length >= minLength,
      `Length must be greater than ${minLength}`
    )
)

export const maxLengthValidator = moize(
  maxLength =>
    new FieldValidator(
      value => !value || value.toString().length <= maxLength,
      `Length must be less than ${maxLength}`
    )
)

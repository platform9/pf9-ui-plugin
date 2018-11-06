import moize from 'moize'
import { isNil } from 'ramda'
import { isPlainObject } from 'util/misc'

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

const fieldIsEmpty = value => isNil(value) || value === '' || value === false

export const emailValidator = new FieldValidator(
  email =>
    fieldIsEmpty(email) ||
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(
      email
    ),
  'Email is invalid'
)

export const requiredValidator = new FieldValidator(
  value => !fieldIsEmpty(value),
  'Field is required'
)

export const matchFieldValidator = moize(
  id =>
    new FieldValidator(
      (value, formFields) => value === formFields[id],
      'Fields do not match'
    )
)

export const lengthValidator = (minLength, maxLength) =>
  new FieldValidator(
    value =>
      fieldIsEmpty(value) ||
      (value.toString().length >= minLength &&
        value.toString().length <= maxLength),
    `Length must be between ${minLength} and ${maxLength}`
  )

export const minLengthValidator = moize(
  minLength =>
    new FieldValidator(
      value => fieldIsEmpty(value) || value.toString().length >= minLength,
      `Length must be greater than ${minLength}`
    )
)

export const maxLengthValidator = moize(
  maxLength =>
    new FieldValidator(
      value => fieldIsEmpty(value) || value.toString().length <= maxLength,
      `Length must be less than ${maxLength}`
    )
)

export const validators = {
  email: emailValidator,
  required: requiredValidator,
  matchField: matchFieldValidator,
  length: lengthValidator,
  minLength: minLengthValidator,
  maxLength: maxLengthValidator
}

export const parseValidator = (key, spec) => {
  if (!validators.hasOwnProperty(key)) {
    if (spec instanceof FieldValidator) {
      return spec
    }
    // Custom validator
    if (typeof spec === 'function') {
      return customValidator(spec)
    }
    throw new Error(`Validator with key ${key} does not exist`)
  }
  const validator = validators[key]
  if (spec === true) {
    return validator
  }
  if (isPlainObject(spec)) {
    const { params, message } = spec
    const validatorWithParams = params ? validator(...params) : validator
    if (message) {
      return validatorWithParams.withMessage(message)
    }
    return validatorWithParams
  }
  if (typeof validator === 'function') {
    return validator(...Array.isArray(spec) ? spec : [spec])
  }
}

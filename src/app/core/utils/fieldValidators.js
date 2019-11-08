import moize from 'moize'
import { isEmpty, isNil, test, allPass, both, is, complement, cond, always, curry } from 'ramda'
import { isPlainObject } from '../../utils/misc'

class FieldValidator {
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

// Create a custom inline validator
export const customValidator = (validator, errorMessage) =>
  new FieldValidator(validator, errorMessage)

const fieldIsUnset = value => isNil(value) || isEmpty(value) || value === false
export const hasMinLength = curry((minLen, value) => both(is(String), val => val.length >= minLen)(value))
export const hasOneLowerChar = both(is(String), test(/[a-z]/))
export const hasOneUpperChar = both(is(String), test(/[A-Z]/))
export const hasOneNumber = both(is(String), test(/[0-9]/))
export const hasOneSpecialChar = both(is(String), test(/[-!@#$%^&*()?]/))

export const emailValidator = new FieldValidator(
  email =>
    fieldIsUnset(email) ||
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(
      email,
    ),
  'Email is invalid',
)

export const requiredValidator = new FieldValidator(
  value => !fieldIsUnset(value),
  'Field is required',
)

export const matchFieldValidator = moize(
  id =>
    new FieldValidator(
      (value, formFields) => value === formFields[id],
      'Fields do not match',
    ),
)

export const lengthValidator = (minLength, maxLength) =>
  new FieldValidator(
    value =>
      fieldIsUnset(value) ||
      (value.toString().length >= minLength &&
        value.toString().length <= maxLength),
    `Length must be between ${minLength} and ${maxLength}`,
  )

export const minLengthValidator = moize(
  minLength =>
    new FieldValidator(
      value => fieldIsUnset(value) || value.toString().length >= minLength,
      `Length must be greater than ${minLength}`,
    ),
)

export const maxLengthValidator = moize(
  maxLength =>
    new FieldValidator(
      value => fieldIsUnset(value) || value.toString().length <= maxLength,
      `Length must be less than ${maxLength}`,
    ),
)

export const passwordValidator = new FieldValidator(
  value => fieldIsUnset(value) || allPass([
    hasMinLength(8),
    hasOneLowerChar,
    hasOneUpperChar,
    hasOneNumber,
    hasOneSpecialChar,
  ])(value),
  // Show a different error message depending on the validation error
  value => cond([
    [complement(hasMinLength(8)), always('Password must be at least 8 characters long')],
    [complement(hasOneLowerChar), always('Password must contain at least one lowercase letter')],
    [complement(hasOneUpperChar), always('Password must contain at least one uppercase letter')],
    [complement(hasOneNumber), always('Password must contain at least one number')],
    [complement(hasOneSpecialChar), always('Password must contain at least one special character')],
  ])(value),
)

export const validators = {
  email: emailValidator,
  password: passwordValidator,
  required: requiredValidator,
  matchField: matchFieldValidator,
  length: lengthValidator,
  minLength: minLengthValidator,
  maxLength: maxLengthValidator,
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

import React, { useContext, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { ValidatedFormContext } from 'core/components/validatedForm/ValidatedForm'
import { requiredValidator } from 'core/utils/fieldValidators'
import { pathOr, isNil } from 'ramda'

export const ValidatedFormInputPropTypes = {
  required: PropTypes.bool,
  validateFormOnChange: PropTypes.bool,
  validations: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  initialValue: PropTypes.any,
}

/**
 * Wrapper for all the inputs that will require some sort of interaction with
 * the ValidatedForm such as validations and text hints on hover
 */
const ValidatedFormInput = ({
  id, initialValue, validateFormOnChange, value, required, validations, onBlur, onChange, children, ...rest
}) => {
  const {
    initialValues,
    values,
    errors,
    setFieldValue,
    updateFieldValue,
    getFieldValue,
    defineField,
    validateField,
    showErrorsOnBlur,
  } = useContext(ValidatedFormContext)

  const defineCurrentField = defineField(id)
  const setCurrentFieldValue = setFieldValue(id)
  const updateCurrentFieldValue = updateFieldValue(id)
  const getCurrentFieldValue = getFieldValue(id)
  const validateCurrentField = validateField(id)
  const currentInitialValue = initialValue !== undefined
    ? initialValue : initialValues[id]
  const currentValue = isNil(value) ? values[id] : value
  const hasError = pathOr(null, [id, 'hasError'], errors)
  const errorMessage = pathOr(null, [id, 'errorMessage'], errors)

  useEffect(() => {
    defineCurrentField({
      validations: required ? Array.isArray(validations)
        ? [requiredValidator, ...validations]
        : { required: true, ...validations }
        : validations,
    })
    if (currentInitialValue !== undefined) {
      setCurrentFieldValue(currentInitialValue)
    }
  }, [validations, required])

  // Notify value changes to the form when the field is controlled
  useEffect(() => {
    if (!isNil(value)) {
      setCurrentFieldValue(value)
    }
  }, [value])

  const handleBlur = useCallback(
    e => {
      if (showErrorsOnBlur) {
        validateCurrentField()
      }
      // Leverage the event to the wrapped input
      if (onBlur) {
        onBlur(e)
      }
    },
    [showErrorsOnBlur, validateCurrentField, onBlur],
  )

  const handleChange = useCallback(
    (value, label) => {
      setCurrentFieldValue(value, validateFormOnChange)
      // Leverage the event to the wrapped input
      if (onChange) {
        onChange(value, label)
      }
    },
    [setCurrentFieldValue, onChange],
  )

  return children({
    ...rest,
    id,
    onChange: handleChange,
    onBlur: handleBlur,
    value: currentValue,
    getCurrentValue: getCurrentFieldValue,
    updateFieldValue: updateCurrentFieldValue,
    hasError,
    errorMessage,
    required,
  })
}

ValidatedFormInput.propTypes = ValidatedFormInputPropTypes
ValidatedFormInput.defaultProps = {
  validations: [],
}

/**
 * withFormContext provides access to the form context through props.
 *
 * This pattern is needed because React does not provide access to context within
 * lifecycle methods (componentDidMount).
 *
 * See: https://github.com/facebook/react/issues/12397#issuecomment-375501574
 *
 * @param {Inject the form context into this Component through props.} Input
 */
const withFormContext = Input =>
  React.forwardRef((props, ref) => (
    <ValidatedFormInput {...props}>
      {(inputProps => <Input {...inputProps} ref={ref} />)}
    </ValidatedFormInput>
  ))

export default withFormContext

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { pickMultiple } from 'core/fp'
import { requiredValidator } from 'core/FieldValidator'
import { ValidatedFormConsumer } from 'core/common/validated_form/ValidatedForm'
import { partial, pathOr } from 'ramda'

export const ValidatedFormInputPropTypes = {
  required: PropTypes.bool,
  validations: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

/**
 * Wrapper for all the inputs that will require some sort of interaction with
 * the ValidatedForm such as validations and text hints on hover
 */
class ValidatedFormInput extends Component {
  static defaultProps = {
    validations: [],
    required: false
  }

  constructor (props) {
    super(props)
    const spec = pickMultiple('validations', 'info')(props)

    if (props.required) {
      spec.validations = Array.isArray(props.validations)
        ? [requiredValidator, ...props.validations]
        : { required: true, ...props.validations }
    }

    props.defineField(spec)
    const { initialValue, setFieldValue } = this.props

    if (initialValue !== undefined) {
      setFieldValue(initialValue)
    }
  }

  handleBlur = e => {
    const { showErrorsOnBlur, validateField } = this.props
    if (showErrorsOnBlur) {
      validateField()
    }
    // Leverage the event to the wrapped input
    if (this.props.onBlur) {
      this.props.onBlur(e)
    }
  }

  handleChange = value => {
    this.props.setFieldValue(value)
    // Leverage the event to the wrapped input
    if (this.props.onChange) {
      this.props.onChange(value)
    }
  }

  handleOnMouseEnter = e => {
    if (this.props.info) {
      this.props.showInfo(this.props.info)
    }
    // Leverage the event to the wrapped input
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e)
    }
  }

  render () {
    return this.props.children({
      onChange: this.handleChange,
      onMouseEnter: this.handleOnMouseEnter,
      onBlur: this.handleBlur
    })
  }
}

ValidatedFormInput.propTypes = ValidatedFormInputPropTypes

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
const withFormContext = Input => ({ id, info, required, validations, ...rest }) => (
  <ValidatedFormConsumer>
    {({
      initialValues,
      values,
      defineField,
      setFieldValue,
      showErrorsOnBlur,
      validateField,
      errors,
      showInfo
    }) => (
      <ValidatedFormInput
        id={id}
        info={info}
        defineField={partial(defineField, [id])}
        setFieldValue={partial(setFieldValue, [id])}
        validateField={partial(validateField, [id])}
        showErrorsOnBlur={showErrorsOnBlur}
        showInfo={showInfo}
        initialValue={initialValues[id]}
        required={required}
        validations={validations}
        value={values[id]}
      >
        {({ onChange, onMouseEnter, onBlur }) => (
          <Input
            {...rest}
            id={id}
            value={values[id]}
            hasError={pathOr(null, [id, 'hasError'], errors)}
            errorMessage={pathOr(null, [id, 'errorMessage'], errors)}
            onChange={onChange}
            onMouseEnter={onMouseEnter}
            onBlur={onBlur}
          />
        )}
      </ValidatedFormInput>
    )}
  </ValidatedFormConsumer>
)

export default withFormContext

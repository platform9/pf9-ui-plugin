import React from 'react'
import PropTypes from 'prop-types'
import KeyValues from 'core/common/KeyValues'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/common/validated_form/withFormContext'
import { compose } from 'core/fp'

class KeyValuesField extends React.Component {
  render () {
    const { id, value, ...restProps } = this.props
    return (
      <div id={id}>
        <KeyValues
          {...restProps}
          entries={value !== undefined ? value : []}
        />
      </div>
    )
  }
}

KeyValuesField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  initialValue: PropTypes.string,
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext
)(KeyValuesField)

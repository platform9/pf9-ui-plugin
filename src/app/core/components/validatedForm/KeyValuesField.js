import React from 'react'
import PropTypes from 'prop-types'
import KeyValues from 'core/components/KeyValues'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { compose } from 'core/../../../utils/fp'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'

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
  withFormContext,
  withInfoTooltip,
)(KeyValuesField)

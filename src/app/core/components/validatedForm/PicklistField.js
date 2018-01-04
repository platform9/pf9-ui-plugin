import React from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import withFormContext from 'core/components/validatedForm/withFormContext'

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
@withFormContext
class PicklistField extends React.Component {
  handleChange = value => {
    const { onChange } = this.props
    if (onChange) {
      onChange(value)
    }
  }

  render () {
    const { id, label, value, showNone, ...restProps } = this.props
    const options = showNone ? [{ value: '', label: 'None' }, ...this.props.options] : this.props.options
    return (
      <div id={id}>
        <Picklist
          {...restProps}
          name={id}
          label={label}
          options={options}
          value={value !== undefined ? value : ''}
          onChange={this.handleChange}
        />
      </div>
    )
  }
}

PicklistField.defaultProps = {
  validations: [],
}

const optionPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })
])

PicklistField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  initialValue: PropTypes.string,

  /** Create an option of 'None' as the first default choice */
  showNone: PropTypes.bool,
}

export default PicklistField

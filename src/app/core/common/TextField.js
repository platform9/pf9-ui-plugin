import React from 'react'
import PropTypes from 'prop-types'
import { default as BaseTextField } from '@material-ui/core/TextField'
import { withFormContext } from 'core/common/ValidatedForm'
import { pickMultiple, filterFields } from 'core/fp'

class TextField extends React.Component {
  constructor (props) {
    super(props)
    const spec = pickMultiple('validations')(props)
    const { id, initialValue, setField } = this.props
    props.defineField(id, spec)
    if (initialValue !== undefined) {
      setField(id, initialValue)
    }
  }

  get restFields () { return filterFields(...withFormContext.propsToExclude)(this.props) }

  handleChange = e => {
    const { id, onChange, setField, type } = this.props
    // HTML specs says that <input type="number"> return strings but it's more useful if we
    // convert it to a `Number` to reduce type casting all over the place.
    const strVal = e.target.value
    const value = (type && type.toLowerCase() === 'number' && strVal !== '') ? Number(strVal) : strVal
    setField(id, value)
    if (onChange) { onChange(value) }
  }

  render () {
    const { id, value } = this.props
    return (
      <div id={id}>
        <BaseTextField
          {...this.restFields}
          value={value[id] !== undefined ? value[id] : ''}
          onChange={this.handleChange}
        />
      </div>
    )
  }
}

TextField.defaultProps = {
  validations: [],
}

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  validations: PropTypes.arrayOf(PropTypes.object),
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
}
export default withFormContext(TextField)

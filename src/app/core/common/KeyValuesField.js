import React from 'react'
import PropTypes from 'prop-types'
import KeyValues from 'core/common/KeyValues'
import { withFormContext } from 'core/common/ValidatedForm'
import { pickMultiple, filterFields } from 'core/fp'

class KeyValuesField extends React.Component {
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

  handleChange = value => {
    const { id, onChange, setField } = this.props
    setField(id, value)
    if (onChange) { onChange(value) }
  }

  render () {
    const { id, value } = this.props
    return (
      <div id={id}>
        <KeyValues
          {...this.restFields}
          entries={value[id] !== undefined ? value[id] : []}
          onChange={this.handleChange}
        />
      </div>
    )
  }
}

KeyValuesField.defaultProps = {
  validations: [],
}

KeyValuesField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  validations: PropTypes.arrayOf(PropTypes.object),
  initialValue: PropTypes.string,
  onChange: PropTypes.func,
}

export default withFormContext(KeyValuesField)

import React from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/common/Picklist'
import { withFormContext } from 'core/common/ValidatedForm'
import { pickMultiple, filterFields } from 'core/fp'

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
class PicklistField extends React.Component {
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

  render () {
    const { id, label, value, setField, showNone } = this.props
    const options = showNone ? [{ value: '', label: 'None' }, ...this.props.options] : this.props.options
    return (
      <div id={id}>
        <Picklist
          name={id}
          label={label}
          {...this.restFields}
          options={options}
          value={value[id] !== undefined ? value[id] : ''}
          onChange={value => setField(id, value)}
        />
      </div>
    )
  }
}

PicklistField.defaultProps = {
  validations: [],
}

PicklistField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ])).isRequired,
  validations: PropTypes.arrayOf(PropTypes.object),
  initialValue: PropTypes.string,

  /** Create an option of 'None' as the first default choice */
  showNone: PropTypes.bool,
}
export default withFormContext(PicklistField)

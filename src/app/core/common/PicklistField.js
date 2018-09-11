import React from 'react'
import PropTypes from 'prop-types'
import Selector from 'core/common/Selector'
import { withFormContext } from 'core/common/ValidatedForm'
import { pickMultiple, filterFields } from 'core/fp'

class PicklistField extends React.Component {
  constructor (props) {
    super(props)
    const spec = pickMultiple('validations')(props)
    props.defineField(props.id, spec)
  }

  get restFields () { return filterFields(...withFormContext.propsToExclude)(this.props) }

  render () {
    const { id, label, options, value, setField } = this.props
    return (
      <div id={id}>
        <Selector
          name={label}
          {...this.restFields}
          list={options}
          value={value[id] !== undefined ? value[id] : ''}
          onChoose={e => setField(this.props.id, e.target.value)}
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
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  validations: PropTypes.arrayOf(PropTypes.object),
  initialValue: PropTypes.string,
}
export default withFormContext(PicklistField)

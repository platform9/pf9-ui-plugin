import React from 'react'
import PropTypes from 'prop-types'
import { FormControlLabel, Checkbox as BaseCheckbox } from '@material-ui/core'
import { withFormContext } from 'core/common/ValidatedForm'
import { pickMultiple, filterFields } from 'core/fp'

class Checkbox extends React.Component {
  constructor (props) {
    super(props)
    const spec = pickMultiple('validations')(props)
    props.defineField(props.id, spec)
  }

  get restFields () { return filterFields(...withFormContext.propsToExclude, 'value')(this.props) }

  handleChange = e => {
    const { id, onChange, setField } = this.props
    setField(id, e.target.checked)
    if (onChange) {
      onChange(e.target.checked)
    }
  }

  render () {
    const { id, value, label } = this.props
    return (
      <div id={id}>
        <FormControlLabel
          label={label}
          control={
            <BaseCheckbox
              {...this.restFields}
              checked={value[id]}
              onChange={this.handleChange}
            />
          }
        />
      </div>
    )
  }
}

Checkbox.defaultProps = {
  validations: [],
}

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  validations: PropTypes.arrayOf(PropTypes.object),
  initialValue: PropTypes.bool,
  onChange: PropTypes.func,
}
export default withFormContext(Checkbox)

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

  render () {
    const { id, value, setField } = this.props
    return (
      <div id={id}>
        <BaseTextField
          {...this.restFields}
          value={value[id] !== undefined ? value[id] : ''}
          onChange={e => setField(this.props.id, e.target.value)}
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
  initialValue: PropTypes.string,
}
export default withFormContext(TextField)

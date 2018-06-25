import React from 'react'
import PropTypes from 'prop-types'
import { default as BaseTextField } from '@material-ui/core/TextField'
import { withFormContext } from 'core/common/ValidatedForm'
import { pickMultiple, filterFields } from 'core/fp'

class TextField extends React.Component {
  constructor (props) {
    super(props)
    const spec = pickMultiple('required', 'validations')(props)
    props.defineField(props.id, spec)
  }

  get restFields () { return filterFields(...withFormContext.propsToExclude)(this.props) }

  render () {
    const { id, value, setField } = this.props
    return (
      <BaseTextField {...this.restFields} value={value[id] || ''} onChange={e => setField(this.props.id, e.target.value)} />
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

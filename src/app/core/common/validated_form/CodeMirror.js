import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from '@material-ui/core'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/common/validated_form/withFormContext'
import { compose } from 'core/fp'
import { withInfoTooltip } from 'app/core/common/InfoTooltip'
import {Controlled as BaseCodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'

require('codemirror/mode/yaml/yaml')

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit
  }
})

class CodeMirror extends React.Component {
  handleChange = (editor, data, value) => {
    const { onChange } = this.props

    if (onChange) {
      onChange(value)
    }
  }

  render () {
    const { id, label, value, classes, hasError, onMouseEnter, errorMessage, onChange, ...restProps } = this.props
    return (
      <FormControl id={id} className={classes.formControl} error={hasError}>
        <FormLabel>{label}</FormLabel>
        <BaseCodeMirror
          {...restProps}
          onBeforeChange={this.handleChange}
          value={value}
        />
        <FormHelperText>{errorMessage}</FormHelperText>
      </FormControl>
    )
  }
}

CodeMirror.propTypes = {
  id: PropTypes.string.isRequired,
  info: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
  withStyles(styles),
  withInfoTooltip,
)(CodeMirror)

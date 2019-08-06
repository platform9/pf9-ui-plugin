import React from 'react'
import PropTypes from 'prop-types'
import { FormControl, FormHelperText, FormLabel } from '@material-ui/core'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { compose } from 'app/utils/fp'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { Controlled as BaseCodeMirror } from 'react-codemirror2'
import './codemirror.css'

require('codemirror/mode/yaml/yaml')

const defaultOptions = {
  lineNumbers: true,
  mode: 'yaml',
  theme: 'default',
  extraKeys: {
    Tab: (cm) => {
      const spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
      cm.replaceSelection(spaces)
    }
  }
}

class CodeMirror extends React.Component {
  handleChange = (editor, data, value) => {
    const { onChange } = this.props

    if (onChange) {
      onChange(value)
    }
  }

  render () {
    const { id, label, value, classes, hasError, onMouseEnter, errorMessage, onChange, options, ...restProps } = this.props
    const combinedOptions = { ...defaultOptions, ...options }
    return (
      <FormControl id={id} error={hasError} fullWidth>
        <FormLabel>{label}</FormLabel>
        <BaseCodeMirror
          {...restProps}
          onBeforeChange={this.handleChange}
          value={value}
          options={combinedOptions}
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
  options: PropTypes.object,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withInfoTooltip, // This HoC causes unnecessary re-renders if declared after withFormContext
  withFormContext,
)(CodeMirror)

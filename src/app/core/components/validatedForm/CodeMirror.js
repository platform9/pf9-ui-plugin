import React, { useCallback, useEffect, createRef } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { FormControl, FormHelperText, FormLabel } from '@material-ui/core'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { compose } from 'app/utils/fp'
import InfoTooltip from 'app/core/components/InfoTooltip'
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
    },
  },
}

const CodeMirror = ({
  id,
  label,
  value,
  getCurrentValue,
  classes,
  hasError,
  errorMessage,
  onChange,
  options,
  info,
  placement,
  ...restProps
}) => {
  const codeMirrorInput = createRef()
  const [open, setOpen] = React.useState(false)
  const openTooltip = useCallback(() => setOpen(true), [])
  const closeTooltip = useCallback(() => setOpen(false), [])
  // TODO Implement "interactive" behavior so that tooltip won't be closed when hovering it

  const handleChange = useCallback((editor, data, value) => {
    if (onChange) {
      onChange(value)
    }
  }, [onChange])
  // Sadly, CodeMirror doesn't expose mouseover/moseleave props, so we must manually attach
  // events to the created DOM element to make the tooltip work
  useEffect(() => {
    const codeMirrorEl = ReactDOM.findDOMNode(codeMirrorInput.current)
    codeMirrorEl.addEventListener('mouseover', openTooltip)
    codeMirrorEl.addEventListener('mouseleave', closeTooltip)
    return () => {
      codeMirrorEl.removeEventListener('mouseover', openTooltip)
      codeMirrorEl.removeEventListener('mouseleave', closeTooltip)
    }
  }, [])

  const combinedOptions = { ...defaultOptions, ...options }

  return (
    <InfoTooltip open={open} info={info} placement={placement}>
      <FormControl
        id={id}
        error={hasError}
        fullWidth
      >
        <FormLabel>{label}</FormLabel>
        <BaseCodeMirror
          {...restProps}
          ref={codeMirrorInput}
          onBeforeChange={handleChange}
          value={value}
          options={combinedOptions}
          onFocus={openTooltip}
          onBlur={closeTooltip}
          onClick={closeTooltip}
        />
        {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
      </FormControl>
    </InfoTooltip>
  )
}

CodeMirror.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.object,
  value: PropTypes.string,
  info: PropTypes.string,
  placement: PropTypes.string,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
)(CodeMirror)

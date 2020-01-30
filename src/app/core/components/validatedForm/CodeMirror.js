import React, { useCallback, useEffect, createRef } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { FormControl, FormHelperText, FormLabel, Typography } from '@material-ui/core'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { compose } from 'app/utils/fp'
import InfoTooltip from 'app/core/components/InfoTooltip'
import { Controlled as BaseCodeMirror } from 'react-codemirror2'
import './codemirror.css'
import { makeStyles } from '@material-ui/styles'

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

// These styles are to match CodeMirrors. We need to find a good way
// to re-define their styles so we can use common variables
const useStyles = makeStyles(theme => ({
  coderMirrorHeader: {
    position: 'relative',
    background: '#f3f3f3',
    padding: '16px 0 5px 16px',
    color: '#303030',
    fontSize: 16,
    '&::after': {
      content: '""',
      position: 'absolute',
      height: 1,
      left: 16,
      right: 16,
      bottom: 0,
      backgroundColor: '#303030',
    },
  },
}))

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
  const { coderMirrorHeader } = useStyles()
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
        <FormLabel><Typography className={coderMirrorHeader} variant="body1">{label}</Typography></FormLabel>
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

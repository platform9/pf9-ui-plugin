import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'

const ImportDataButton = ({ children, id, onImport, ...rest }) => {
  const importData = ({ target }) => {
    const file = target.files[0]
    const fileReader = new FileReader()
    fileReader.onloadend = e => {
      onImport(e.target.result)
      // Reset the target value so the next onloadend still triggers.
      // https://stackoverflow.com/questions/26634616/filereader-upload-same-file-again-not-working
      target.value = ''
    }
    fileReader.readAsText(file)
  }

  return (
    <React.Fragment>
      <input
        accept="application/json,.json"
        style={{ display: 'none' }}
        id={id}
        type="file"
        onChange={importData}
      />
      <label htmlFor={id}>
        <Button component="span" {...rest}>{children}</Button>
      </label>
    </React.Fragment>
  )
}

ImportDataButton.propTypes = {
  id: PropTypes.string.isRequired,
  color: PropTypes.string,
  onImport: PropTypes.func.isRequired,
  variant: PropTypes.string,
}

ImportDataButton.defaultProps = {
  variant: 'contained',
}

export default ImportDataButton

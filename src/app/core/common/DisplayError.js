import React from 'react'
import PropTypes from 'prop-types'
import Alert from 'core/common/Alert'

const DisplayError = ({ error }) => <Alert variant="error" message={error} />

DisplayError.propTypes = {
  error: PropTypes.string,
}

DisplayError.defaultProps = {
  error: 'Unspecified error',
}

export default DisplayError

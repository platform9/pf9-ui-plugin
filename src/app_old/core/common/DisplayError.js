import React from 'react'
import PropTypes from 'prop-types'

const DisplayError = ({ error }) => <div>{error}</div>

DisplayError.propTypes = {
  error: PropTypes.string,
}

DisplayError.defaultProps = {
  error: 'Unspecified error',
}

export default DisplayError

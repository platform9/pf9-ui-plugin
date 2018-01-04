import React from 'react'
import PropTypes from 'prop-types'

const Loader = ({ message }) => <div>{message}</div>

Loader.propTypes = {
  message: PropTypes.string,
}

Loader.defaultProps = {
  message: 'Loading...',
}

export default Loader

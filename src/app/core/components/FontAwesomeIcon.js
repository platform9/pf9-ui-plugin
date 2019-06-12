import React from 'react'
import classnames from 'classnames'

const FontAwesomeIcon = ({ children, className, ...rest }) =>
  <i className={classnames(`fal fa-fw fa-lg fa-${children}`, className)} {...rest} />

export default FontAwesomeIcon

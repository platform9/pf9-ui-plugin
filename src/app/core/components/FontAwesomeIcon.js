import React from 'react'
import clsx from 'clsx'

const FontAwesomeIcon = ({ children, className, ...rest }) =>
  <i className={clsx(`fal fa-fw fa-lg fa-${children}`, className)} {...rest} />

export default FontAwesomeIcon

import React from 'react'
import clsx from 'clsx'

const FontAwesomeIcon = ({ children, className, size, solid, ...rest }) => {
  const defaultClasses = [
    'fal',
    'fa-fw',
    (size ? `fa-${size}` : 'fa-lg'),
    `fa-${children}`,
    (solid ? 'fas' : ''),
  ]
  return (
    <i className={clsx(defaultClasses.join(' '), className)} {...rest} />
  )
}

export default FontAwesomeIcon

import React, { forwardRef } from 'react'
import clsx from 'clsx'

const FontAwesomeIcon = forwardRef(({ children, className, size, solid, ...rest }, ref) => {
  const defaultClasses = [
    'fal',
    'fa-fw',
    (size ? `fa-${size}` : 'fa-lg'),
    `fa-${children}`,
    (solid ? 'fas' : ''),
  ]
  return (
    <i ref={ref} className={clsx(...defaultClasses, className)} {...rest} />
  )
})

export default FontAwesomeIcon

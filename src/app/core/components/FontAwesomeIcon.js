import React, { forwardRef } from 'react'
import clsx from 'clsx'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
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

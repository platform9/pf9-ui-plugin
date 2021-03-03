import React, { forwardRef } from 'react'
import clsx from 'clsx'

interface Props extends React.HTMLAttributes<HTMLElement> {
  children?: any
  size?: string
  solid?: boolean
  brand?: boolean
  className?: string
  name?: string
  spin?: boolean
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const FontAwesomeIcon = forwardRef<HTMLElement, Props>(
  (
    { children, name, className, size, solid, brand, spin, ...rest },
    ref?: React.Ref<HTMLElement>,
  ) => {
    const classGroup = solid ? 'fas' : brand ? 'fab' : 'fal'
    const defaultClasses = [
      classGroup,
      'fa-fw',
      size ? `fa-${size}` : 'fa-lg',
      `fa-${name || children}`,
      spin ? 'fa-spin' : '',
    ]
    return <i ref={ref} className={clsx(...defaultClasses, className)} {...rest} />
  },
)

export default FontAwesomeIcon

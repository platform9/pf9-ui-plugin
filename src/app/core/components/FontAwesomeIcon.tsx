import React, { forwardRef } from 'react'
import clsx from 'clsx'

interface Props extends React.HTMLAttributes<HTMLElement> {
  children?: any
  size?: string
  solid?: boolean
  brand?: boolean
  className?: string
  name?: string
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const FontAwesomeIcon: React.ComponentType<Props> = forwardRef(
  ({ children, name, className, size, solid, brand, ...rest }, ref?: React.Ref<HTMLElement>) => {
    const classGroup = solid ? 'fas' : brand ? 'fab' : 'fal'
    const defaultClasses = [
      classGroup,
      'fa-fw',
      size ? `fa-${size}` : 'fa-lg',
      `fa-${name || children}`,
    ]
    return <i ref={ref} className={clsx(...defaultClasses, className)} {...rest} />
  },
)

export default FontAwesomeIcon as React.FC<Props>

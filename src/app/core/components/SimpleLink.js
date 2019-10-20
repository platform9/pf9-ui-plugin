import React, { forwardRef, useCallback } from 'react'
import { Link } from '@material-ui/core'
import useReactRouter from 'use-react-router'

// We need to destructure staticContext even though we are not using it in order to
// work around this issue: https://github.com/ReactTraining/react-router/issues/4683
// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const SimpleLink = forwardRef(({
  onClick,
  src,
  children,
  staticContext,
  ...rest
}, ref) => {
  const { history } = useReactRouter()
  const handleClick = useCallback(e => {
    // Prevent links inside of a table row from triggering row selection.
    e.stopPropagation()
    if (onClick) {
      e.preventDefault()
      onClick(e)
    }
    // If there is no provided onClick, just use the `src` as a normal link.
    if (src && !src.startsWith('http')) {
      // local paths should use the History's push state
      e.preventDefault()
      return history.push(src)
    }
    // Any path that starts with http should be treated as an external link
  }, [src, history])

  return (
    <Link
      ref={ref}
      href={src || 'javascript:;'}
      onClick={handleClick}
      {...rest}
    >
      {children || src}
    </Link>
  )
})

export default SimpleLink

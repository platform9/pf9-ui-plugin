import React from 'react'
import { withRouter } from 'react-router'
import { Link } from '@material-ui/core'

// We need to destructure staticContext even though we are not using it in order to
// work around this issue: https://github.com/ReactTraining/react-router/issues/4683
const SimpleLink = ({
  className,
  onClick,
  src,
  children,
  history,
  staticContext,
  match,
  location,
  ...rest
}) => {
  const handleClick = e => {
    // Prevent links inside of a table row from triggering row selection.
    e.stopPropagation()
    if (onClick) {
      e.preventDefault()
      onClick(e)
    }
    // If there is no provided onClick, just use the `src` as a normal link.
    if (!src.startsWith('http')) {
      // local paths should use the History's push state
      e.preventDefault()
      return history.push(src)
    }
    // Any path that starts with http should be treated as an external link
  }

  return (
    <Link
      href={src || 'javascript:;'}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </Link>
  )
}

export default withRouter(SimpleLink)

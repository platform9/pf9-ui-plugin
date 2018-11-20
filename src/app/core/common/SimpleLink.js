import React from 'react'

const SimpleLink = ({ onClick, src, children, ...rest }) => {
  const handleClick = e => {
    // Prevent links inside of a table row from triggering row selection.
    e.stopPropagation()
    if (onClick) {
      e.preventDefault()
      onClick(e)
    }
    // If there is no provided onClick, just use the `src` as a normal link.
  }

  return (
    <a href={src || '#'} onClick={handleClick} {...rest}>{children}</a>
  )
}

export default SimpleLink

import React from 'react'
import ReactDOM from 'react-dom'
import { AppContext } from 'core/AppProvider'

const TopExtraContent = ({ children }) => {
  const { extraContentRef } = React.useContext(AppContext)
  if (!extraContentRef || !extraContentRef.current) {
    return null
  }
  return ReactDOM.createPortal(
    children,
    extraContentRef.current,
  )
}

export default TopExtraContent

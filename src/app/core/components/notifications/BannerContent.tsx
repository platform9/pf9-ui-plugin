import React, { FC } from 'react'
import ReactDOM from 'react-dom'
import { BannerContext } from 'core/providers/BannerProvider'

const BannerContent: FC = ({ children }) => {
  const { bannerContainer } = React.useContext(BannerContext)
  if (!bannerContainer) {
    return null
  }
  return ReactDOM.createPortal(
    children,
    bannerContainer,
  )
}

export default BannerContent

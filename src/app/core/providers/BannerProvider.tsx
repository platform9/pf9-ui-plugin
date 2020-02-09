import React, { createContext, FC, useState } from 'react'

interface BannerContextType {
  bannerContainer: HTMLDivElement
  setBannerContainer: (container: HTMLDivElement) => void
}

export const BannerContext = createContext<BannerContextType>({
  bannerContainer: null,
  setBannerContainer: (container) => {
    console.error('BannerContainer not found')
  },
})

const BannerProvider: FC = ({ children }) => {
  const [bannerContainer, setBannerContainer] = useState(null)

  return (
    <BannerContext.Provider value={{ bannerContainer, setBannerContainer }}>
      {children}
    </BannerContext.Provider>
  )
}

export default BannerProvider

export const withBanner = (Component) => (props) => (
  <BannerContext.Consumer>
    {(bannerContainer) => <Component {...props} bannerContainer={bannerContainer} />}
  </BannerContext.Consumer>
)

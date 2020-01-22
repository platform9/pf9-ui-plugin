import React, {
  createContext,
  FC,
  ReactNode,
  Reducer,
  useCallback,
  useContext,
  useReducer,
} from 'react'
import uuid from 'uuid'
import { append, takeLast } from 'ramda'
import { except, pipe } from 'utils/fp'
import {
  BannerContentOptions,
  MessageTypes,
} from 'core/components/notifications/model'

const concurrentBanners = 5

interface BannerReducerAction {
  type: 'add' | 'remove'
  payload: BannerContentOptions
}

const bannerReducer: Reducer<BannerContentOptions[], BannerReducerAction> = (state, { type, payload }) => {
  switch (type) {
    case 'add':
      return pipe(
        takeLast(concurrentBanners - 1),
        append(payload),
      )(state)
    case 'remove':
      return except(payload, state)
    default:
      return state
  }
}

type ShowBannerFn = (content: ReactNode, type?: MessageTypes, dismissable?: boolean) => void

export const BannerContext = createContext<{
  banners: BannerContentOptions[]
  showBanner: ShowBannerFn
}>(null)

const BannerProvider: FC = ({ children }) => {
  const [banners, dispatch] = useReducer(bannerReducer, [])
  const showBanner: ShowBannerFn = useCallback((content, variant = MessageTypes.info, dismissable = true) => {
    const payload = {
      id: uuid.v4(),
      content,
      variant,
      dismissable,
      onClose: () => dispatch({ type: 'remove', payload }),
    }
    dispatch({ type: 'add', payload })
  }, [])

  return (
    <BannerContext.Provider value={{ showBanner, banners }}>
      {children}
    </BannerContext.Provider>
  )
}

export default BannerProvider

export const withBanner = Component => props =>
  <BannerContext.Consumer>
    {({ showBanner }) => <Component {...props} showBanner={showBanner} />}
  </BannerContext.Consumer>

export const useBanner: () => ShowBannerFn = () => {
  const { showBanner } = useContext(BannerContext)
  return showBanner
}

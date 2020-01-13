import React, {
  FC,
  useReducer,
  useCallback,
  Reducer,
  useContext,
  createContext
} from 'react'
import uuid from 'uuid'
import { append, takeLast, reject, whereEq } from 'ramda'
import { except, pipe } from 'utils/fp'
import { MessageTypes, MessageOptions } from 'core/components/toasts/model'
// import BannerContainer from 'core/components/toasts/BannerContainer'

const concurrentBanners = 5

interface BannerReducerAction {
  type: 'add' | 'remove'
  payload: MessageOptions
}

const bannerReducer: Reducer<MessageOptions[], BannerReducerAction> = (state, { type, payload }) => {
  switch (type) {
    case 'add':
      return pipe(
        takeLast(concurrentBanners - 1),
        // Remove previous duplicated messages to prevent flooding the screen
        reject(whereEq({
          text: payload.text,
          variant: payload.variant,
        })),
        append(payload)
      )(state)
    case 'remove':
      return except(payload, state)
    default:
      return state
  }
}

type ShowBannerFn = (text: string, type?: MessageTypes, dismissable?: boolean) => void

const BannerContext = createContext<ShowBannerFn>(null)

const BannerProvider: FC = ({ children }) => {
  const [banners, dispatch] = useReducer(bannerReducer, [])
  console.log(banners)
  const showBanner: ShowBannerFn = useCallback((text, variant = MessageTypes.info, dismissable = true) => {
    const payload = {
      id: uuid.v4(),
      text,
      variant,
      dismissable,
      isOpen: true,
      onClose: () => dispatch({ type: 'remove', payload })
    }
    dispatch({ type: 'add', payload })
  }, [])

  return (
    <BannerContext.Provider value={showBanner}>
      {/* <BannerContainer banners={banners} /> */}
      {children}
    </BannerContext.Provider>
  )
}

export default BannerProvider

export const withBanner = Component => props =>
  <BannerContext.Consumer>
    {showBanner => <Component {...props} showBanner={showBanner} />}
  </BannerContext.Consumer>

export const useBanner: () => ShowBannerFn = () => {
  return useContext(BannerContext)
}

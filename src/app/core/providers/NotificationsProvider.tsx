import React, { createContext } from 'react'
import ApiClient from 'api-client/ApiClient'

type UnsubscribeFnType = () => void
type SubscriberFnType = (event: Object) => UnsubscribeFnType

interface INotificationContext {
  subscribe?: SubscriberFnType
}

export const NotificationsContext = createContext<INotificationContext>({})

const getWebsocketUrl = () => {
    const catalog = ApiClient.getInstance().serviceCatalog
    if (!catalog) return console.error('Error loading serviceCatalog from ApiClient')

    const notificationService = catalog.find(x => x.type === 'notifications')
    if (!notificationService) return console.error('notification service not found in keystone service catalog')

    const url = notificationService.endpoints[0].url
    return url.replace(/^https/, 'wss')
}

interface State {
  handlers: SubscriberFnType[]
}
class NotificationsProvider extends React.Component<{}, State> {
  socket: WebSocket

  state = {
    handlers: []
  }

  handleOpen = () => {
    console.log('socket opened')
  }

  handleClose = () => {
    console.log('socket closed')
    // Is it closed due to some error.  Do we want to attempt to reconnect?
  }

  handleMessage = (event: any) => {
    const message = event.data
    this.state.handlers.forEach(handler => handler(message))

    // TODO: handle the messages
    console.log(message)
  }

  subscribe (handler: SubscriberFnType) {
    this.setState(state => ({ handlers: [...state.handlers, handler] }))
    return () => {
      this.setState(state => ({ handlers: state.handlers.filter(x => x !== handler ) }))
    }
  }

  componentDidMount () {
    // TODO, it is attempting to establish a websocket but the auth is failing.
    // How are we supposed to auth this?
    console.log('componentDidMount')
    const wsUrl = getWebsocketUrl()
    this.socket = new WebSocket(wsUrl)
    this.socket.addEventListener('open', this.handleOpen)
    this.socket.addEventListener('close', this.handleClose)
    this.socket.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount () {
    this.socket.removeEventListener('open', this.handleOpen)
    this.socket.removeEventListener('close', this.handleClose)
    this.socket.removeEventListener('message', this.handleMessage)
  }
  
  render () {
    return (
      <NotificationsContext.Provider value={{ subscribe: this.subscribe }}>
        {this.props.children}
      </NotificationsContext.Provider>
    )
  }
}

export default NotificationsProvider

export const withNotifications = (Component) => (props) => (
  <NotificationsContext.Consumer>
    {({ subscribe }) => <Component {...props} onNotification={subscribe} />}
  </NotificationsContext.Consumer>
)
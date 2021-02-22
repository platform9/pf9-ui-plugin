import ApiClient from 'api-client/ApiClient'
import { except } from 'utils/fp'

type SubscriberFnType = (event: Object) => void

const client = ApiClient.getInstance()
const { keystone } = client

const getWebSocketUrl = async () => {
  const catalog = await keystone.getServiceCatalog()

  if (!catalog) return console.error('Error loading serviceCatalog from ApiClient')

  const notificationService = catalog.find((x) => x.type === 'notifications')
  if (!notificationService)
    return console.error('notification service not found in keystone service catalog')

  let url = notificationService.endpoints[0].url
  url = url.replace(/^https/, 'wss')
  url = `${url}?token=${client.scopedToken}`
  return url
}

class PushEventManager {
  private static instance: PushEventManager
  private socket: WebSocket
  public subscribers: SubscriberFnType[] = []
  private clearIntervalId = null

  constructor() {
    this.subscribers = []
  }

  public static getInstance() {
    if (!PushEventManager.instance) {
      PushEventManager.instance = new PushEventManager()
    }
    return PushEventManager.instance
  }

  private readonly clearInterval = () => {
    clearInterval(this.clearIntervalId)
    this.clearIntervalId = null
  }

  private readonly handleOpen = () => {
    console.info('Websocket connection opened')
    this.clearInterval()
  }

  private readonly handleClose = () => {
    const RETRY_INTERVAL_SECONDS = 10

    this.clearIntervalId = setInterval(() => {
      console.info(`PushEvent websocket closed, retrying in ${RETRY_INTERVAL_SECONDS} seconds.`)
      this.clearInterval()
      this.disconnect() // needed to remove the eventListeners
      this.connect()
    }, RETRY_INTERVAL_SECONDS * 1000)
    console.info('Websocket connection closed')
  }

  private readonly handleMessage = (event: MessageEvent) => {
    const message = event.data
    try {
      const data = JSON.parse(message)
      if (!data.type) {
        // ignore anything that doesn't follow the spec like `heartbeat` events
        return
      }
      this.subscribers.forEach((fn) => fn(data))
    } catch (e) {
      console.error('Error parsing JSON from websocket.', message, e)
    }
  }

  public readonly connect = async () => {
    // TODO re-enable websocket when the backend starts to send us data
    return
    // const wsUrl = await getWebSocketUrl()
    // if (!wsUrl) {
    //   this.handleClose()
    //   return this
    // }
    // this.socket = new WebSocket(wsUrl)
    // this.socket.addEventListener('open', this.handleOpen)
    // this.socket.addEventListener('close', this.handleClose)
    // this.socket.addEventListener('message', this.handleMessage)
    // return this
  }

  public readonly disconnect = () => {
    if (!this.socket) {
      return
    }
    this.socket.removeEventListener('open', this.handleOpen)
    this.socket.removeEventListener('close', this.handleClose)
    this.socket.removeEventListener('message', this.handleMessage)
    this.socket = null
  }

  public readonly subscribe = (listener: SubscriberFnType) => {
    this.subscribers.push(listener)
    return () => {
      this.subscribers = except(listener, this.subscribers)
    }
  }
}

export default PushEventManager

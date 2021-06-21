import { except } from 'utils/fp'

interface WatchdogHandler {
  frequency: number
  currentTime: number
  completed: boolean
  handler: (dispatch) => void
}

// todo test
/* 
  Watchdog.register({ handler: () => console.log('handler 1'), frequency: 1000 }) // every second
  Watchdog.register({ handler: () => console.log('handler 2'), frequency: 1000 * 5 }) // every 5 seconds
  Watchdog.register({ handler: () => console.log('handler 3'), frequency: 0 }) // only run once
*/

class Watchdog {
  static handlers: WatchdogHandler[] = [] as WatchdogHandler[]
  private timer: any = undefined
  private static instance: Watchdog

  static init(frequency, dispatch) {
    if (!Watchdog.instance) {
      Watchdog.instance = new Watchdog(frequency, dispatch)
    }
    return Watchdog.instance
  }

  static getInstance() {
    if (!Watchdog.instance) {
      throw new Error(
        'Watchdog instance has not been initialized, please call Watchdog.init to instantiate it',
      )
    }
    return Watchdog.instance
  }

  constructor(public readonly frequency, private readonly dispatch) {
    this.setup()
  }

  public setup() {
    this.timer = setInterval(() => {
      Watchdog.handlers.forEach((handlerObj) => {
        if (handlerObj.frequency === 0 && handlerObj.completed) {
          return
        }
        handlerObj.currentTime += this.frequency
        if (handlerObj.frequency < handlerObj.currentTime && !handlerObj.completed) {
          if (handlerObj.frequency === 0) {
            handlerObj.completed = true
          }
          handlerObj.handler(this.dispatch)
          handlerObj.currentTime = 0
        }
      })
    }, this.frequency)
  }

  public destroy() {
    clearInterval(this.timer)
    this.timer = undefined
    Watchdog.handlers = []
  }

  static register({ frequency = 0, handler }) {
    Watchdog.handlers.push({ frequency, handler, currentTime: frequency, completed: false })
    return () => {
      Watchdog.handlers = except(handler, Watchdog.handlers)
    }
  }
}

export default Watchdog

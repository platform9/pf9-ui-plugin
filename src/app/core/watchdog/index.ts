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
  }

  static register({ frequency = 0, handler }) {
    Watchdog.handlers.push({ frequency, handler, currentTime: frequency, completed: false })
    return () => {
      Watchdog.handlers = except(handler, Watchdog.handlers)
    }
  }
}

export default Watchdog

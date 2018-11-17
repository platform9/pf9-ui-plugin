import React, { Component } from 'react'
import {
  isEmpty,
  lensProp,
  over,
  pluck,
  propSatisfies,
  reject,
  toPairs,
  view
} from 'ramda'
import { ensureArray } from 'core/fp'

const HotKeysContext = React.createContext({
  setHotKeyHandler: function () {
    throw new Error('HotKeysProvider not found')
  },
  unsetHotKeyHandlers: function () {
    throw new Error('HotKeysProvider not found')
  },
})

const keyHandlersLens = lensProp('hotKeyHandlers')

export default class HotKeysProvider extends Component {
  state = {
    hotKeyHandlers: {},

    setHotKeyHandler: (key, fn, options) => {
      this.setState(over(keyHandlersLens,
        handlers => ({
          ...handlers,
          [key]: [...ensureArray(handlers[key]), {fn, options}]
        })
      ))
    },

    unsetHotKeyHandlers: (key, handlerFunctions) => {
      this.setState(over(keyHandlersLens,
        handlers => ({
          ...handlers,
          [key]: reject(
            propSatisfies(
              fn => handlerFunctions.includes(fn), 'fn'), handlers[key]
          )
        })
      ))
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  stopCallback = e => {
    const target = e.target || e.srcElement
    // stop for input, select, and textarea
    return ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
      target.isContentEditable
  }

  handleKeyDown = e => {
    const hotkeyHandlers = this.state.hotKeyHandlers[e.key]

    if (hotkeyHandlers &&
      !isEmpty(hotkeyHandlers) &&
      !this.stopCallback(e)) {
      hotkeyHandlers.forEach(({fn, options}) => {
        if (options.ctrlKey === e.ctrlKey) {
          e.preventDefault()
          fn(e)
        }
      })
    }
  }

  render () {
    const { children } = this.props
    const { setHotKeyHandler, unsetHotKeyHandlers } = this.state
    return (
      <HotKeysContext.Provider value={{setHotKeyHandler, unsetHotKeyHandlers}}>
        {children}
      </HotKeysContext.Provider>
    )
  }
}

class HotKeysConsumerWrapper extends Component {
  static contextType = HotKeysContext;

  state = {
    hotKeyHandlers: {},
  }

  componentWillUnmount () {
    this.unsetHotKeysHandlers()
  }

  unsetHotKeysHandlers () {
    const handlers = view(keyHandlersLens, this.state) || {}

    toPairs(handlers).forEach(([key, handlers]) => {
      this.context.unsetHotKeyHandlers(key, pluck(['fn'], handlers))
    })
  }

  setHotKeyHandler = (key, fn, options) => {
    // Keep a reference of the key handlers to be able to remove them
    // when the components unmounts
    this.setState(over(keyHandlersLens,
      handlers => ({
        ...handlers,
        [key]: [...ensureArray(handlers[key]), {fn, options}]
      })
    ))
    this.context.setHotKeyHandler(key, fn, options)
  }

  render () {
    return this.props.children(this.setHotKeyHandler)
  }
}

export const withHotKeys = Component => props =>
  <HotKeysConsumerWrapper>
    {
      (setHotKeyHandler) =>
        <Component {...props} setHotKeyHandler={setHotKeyHandler} />
    }
  </HotKeysConsumerWrapper>

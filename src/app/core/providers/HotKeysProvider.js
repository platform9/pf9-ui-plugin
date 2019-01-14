import React, { Component } from 'react'
import { isEmpty, lensProp, over, pluck, view } from 'ramda'

const HotKeysContext = React.createContext({
  setHotKeyHandler: function () {
    throw new Error('HotKeysProvider not found')
  },
  unsetHotKeyHandlers: function () {
    throw new Error('HotKeysProvider not found')
  },
})
const keyHandlersLens = lensProp('hotKeyHandlers')
const editableInputs = ['INPUT', 'SELECT', 'TEXTAREA']
const pressingSpecialKey = e => e.metaKey || e.altKey || e.shiftKey
const isEditableInput = e => {
  const target = e.target || e.srcElement
  // input, select, and textarea are always considered editable inputs
  return editableInputs.includes(target.tagName) ||
    target.isContentEditable
}

export default class HotKeysProvider extends Component {
  state = {
    hotKeyHandlers: {},

    /**
     * Assign a key down handler for a specific key
     * @param key key to bind
     * @param fn function to trigger
     * @param options { whileEditing, ctrlKey }
     */
    setHotKeyHandler: (key, fn, options) => {
      this.setState(over(keyHandlersLens,
        handlers => ({
          ...handlers,
          [key]: [...(handlers[key] || []), { fn, options }]
        })
      ))
    },

    unsetHotKeyHandlers: (key, handlerFunctions) => {
      this.setState(over(keyHandlersLens,
        handlers => ({
          ...handlers,
          [key]: handlers[key].filter(handler =>
            !handlerFunctions.includes(handler.fn))
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

  handleKeyDown = e => {
    const hotkeyHandlers = this.state.hotKeyHandlers[e.key]
    if (hotkeyHandlers && !isEmpty(hotkeyHandlers) && !pressingSpecialKey(e)) {
      hotkeyHandlers.forEach(({ fn, options }) => {
        if ((!options.ctrlKey || options.ctrlKey === e.ctrlKey) &&
          (options.whileEditing || !isEditableInput(e))) {
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
      <HotKeysContext.Provider
        value={{ setHotKeyHandler, unsetHotKeyHandlers }}>
        {children}
      </HotKeysContext.Provider>
    )
  }
}

class HotKeysConsumerWrapper extends Component {
  static contextType = HotKeysContext

  state = {
    hotKeyHandlers: {},
  }

  componentWillUnmount () {
    this.unsetHotKeysHandlers()
  }

  unsetHotKeysHandlers () {
    const handlers = view(keyHandlersLens, this.state) || {}

    Object.entries(handlers).forEach(([key, handlers]) => {
      this.context.unsetHotKeyHandlers(key, pluck('fn', handlers))
    })
  }

  setHotKeyHandler = (key, fn, options = {}) => {
    // Keep a reference of the key handlers to be able to remove them
    // when the components unmounts
    this.setState(over(keyHandlersLens,
      handlers => ({
        ...handlers,
        [key]: [...(handlers[key] || []), { fn, options }]
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

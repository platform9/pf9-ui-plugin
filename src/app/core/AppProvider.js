import React from 'react'
import PropTypes from 'prop-types'
import { assocPath, flatten, pipe } from 'ramda'

export const AppContext = React.createContext({})

class AppProvider extends React.PureComponent {
  state = {
    ...this.props.initialContext,

    session: {},

    initSession: async (unscopedToken, username) => {
      return this.state.setContext({
        session: {
          unscopedToken,
          username,
          loginSuccessful: true,
        },
      })
    },

    updateSession: async (path, value) => {
      return this.state.setContext(
        assocPath(flatten(['session', path]), value),
      )
    },

    destroySession: async () => {
      return this.state.setContext({
        session: {},
      })
    },

    // Get an updated version of the current context
    getContext: getterFn => {
      // Return all values if no getterFn is specified
      return getterFn ? getterFn(this.state) : this.state
    },

    setContext: (setterFn, cb) => {
      // If the `setState` async callback is not passed in default to
      // return a Promise.
      return new Promise((resolve, reject) => {
        if (cb) {
          return this.setState(setterFn, pipe(cb, resolve))
        }
        setImmediate(() => { window.context = this.state })
        this.setState(setterFn, resolve)
      })
    },
  }

  componentDidMount () {
    // For debugging and development convenience
    window.context = this.state
    window.setContext = this.state.setContext
  }

  render () {
    return (
      <AppContext.Provider value={this.state}>
        {this.props.children}
      </AppContext.Provider>
    )
  }
}

AppProvider.propTypes = {
  initialContext: PropTypes.object,
}

AppProvider.defaultProps = {
  initialContext: {
    initialized: false,
    sessionLoaded: false
  },
}

export const withAppContext = Component => props =>
  <AppContext.Consumer>
    {
      ({ getContext, setContext, loadFromContext, initSession, updateSession, destroySession, ...rest }) =>
        <Component
          {...props}
          initSession={initSession}
          updateSession={updateSession}
          destroySession={destroySession}
          getContext={getContext}
          setContext={setContext}
          loadFromContext={loadFromContext}
          context={rest}
        />
    }
  </AppContext.Consumer>

export default AppProvider

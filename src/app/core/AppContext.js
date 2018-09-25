import React from 'react'
import PropTypes from 'prop-types'
import { setStateLens } from 'core/fp'

import { getStorage, setStorage } from 'core/common/pf9-storage'

const userPreferencesKey = username => `user-preferences-${username}`
const getUserPrefs = username => getStorage(userPreferencesKey(username)) || {}
const setUserPrefs = (username, prefs) => setStorage(userPreferencesKey(username), prefs)

const Context = React.createContext({})
export const Consumer = Context.Consumer
export const Provider = Context.Provider

class AppContext extends React.Component {
  state = {
    ...this.props.initialContext,

    setContext: (...args) => {
      this.setState(...args)
      setImmediate(() => { window.context = this.state })
    },

    // Utility function that sets both context.session.userPreferences[key] and
    // also sets it in localStorage.  We might want to move this into its own
    // class later on if AppContext gets cluttered.
    setUserPreference: (key, value) => {
      const path = ['session', 'userPreferences', key]
      this.setState(setStateLens(value, path))

      const { username } = this.state.session
      const prefs = getUserPrefs(username)
      prefs[key] = value
      setUserPrefs(username, prefs)
    },

    getUserPreference: key => {
      const { username } = this.state.session
      const prefs = getUserPrefs(username)
      return prefs[key]
    },

    getUserPreferences: (username = this.state.session.username) => {
      return getUserPrefs(username)
    }
  }

  componentDidMount () {
    // For debugging and development convenience
    window.context = this.state
    window.setContext = this.state.setContext
  }

  render () {
    return (
      <Provider value={this.state}>
        {this.props.children}
      </Provider>
    )
  }
}

AppContext.propTypes = {
  initialContext: PropTypes.object
}

AppContext.defaultProps = {
  initialContext: {}
}

export const withAppContext = Component => props =>
  <Consumer>
    {
      ({ setContext, getUserPreferences, getUserPreference, setUserPreference, ...rest }) =>
        <Component
          {...props}
          setContext={setContext}
          context={rest}
          setUserPreference={setUserPreference}
          getUserPreferences={getUserPreferences}
          getUserPreference={getUserPreference}
        />
    }
  </Consumer>

export default AppContext

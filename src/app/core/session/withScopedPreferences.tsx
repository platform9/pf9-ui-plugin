import React from 'react'
import useScopedPreferences from 'core/session/useScopedPreferences'

export const withScopedPreferences = (storeKey) => (Component) => {
  return (props) => {
    const [prefs, updatePrefs] = useScopedPreferences(storeKey)
    return <Component {...props} preferences={prefs} updatePreferences={updatePrefs} />
  }
}

export default withScopedPreferences

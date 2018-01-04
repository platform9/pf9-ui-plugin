import React from 'react'

// Google Chrome stubbornly refuses to respect the autocomplete="off" HTML attribute so
// we have to give it a "fake" field for it to autocomplete that never gets "used".

const NoAutofillHack = () => (
  <div style={{ display: 'none' }}>
    <input type="text" name="username" />
    <input type="password" name="password" />
  </div>
)

export default NoAutofillHack

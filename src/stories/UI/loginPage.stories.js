import React from 'react'
import { addStories } from '../helpers'
import LoginPage from './loginPage'

addStories('UI', {
  'Login Page with new style': () => (
    <LoginPage />
  )
})

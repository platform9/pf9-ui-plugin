import React from 'react'
import { addStoriesFromModule } from '../helpers'
import LoginPage from './loginPage'

const addStories = addStoriesFromModule(module)

addStories('UI', {
  'Login Page with new style': () => (
    <LoginPage />
  )
})

import React from 'react'
import { addStories } from '../helpers'

import Logon from '../../app/static/Components/Layouts/Logon'

addStories('Logon Page', {
  'Logon page test': () => (
    <Logon />
  )
})

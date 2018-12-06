import React from 'react'
import { addStoriesFromModule } from '../helpers'

import KeyValues from 'core/common/KeyValues'

const addStories = addStoriesFromModule(module)

addStories('Common Components/KeyValues', {
  'Default settings': () => (
    <KeyValues />
  ),

  'Pre-populated': () => {
    const entries = [
      { key: 'foo', value: 'bar' },
      { key: 'aaa', value: '111' },
      { key: 'bbb', value: '222' },
      { key: 'ccc', value: '333' },
    ]
    return (
      <KeyValues entries={entries} />
    )
  },

  'Populated w/ suggestions': () => {
    return (
      <KeyValues entries={[]} keySuggestions={['one', 'two', 'three']} />
    )
  }
})

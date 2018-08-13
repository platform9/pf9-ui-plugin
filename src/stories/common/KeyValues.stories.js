import React from 'react'
import { addStories } from '../helpers'

import KeyValues from 'core/common/KeyValues'

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

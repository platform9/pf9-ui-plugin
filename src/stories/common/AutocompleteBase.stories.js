import React from 'react'
import { addStories } from '../helpers'

import AutocompleteBase from 'core/common/AutocompleteBase'

const suggestions = 'one two three four five six seven eight nine ten'.split(
  ' '
)

addStories('Common Components/AutocompleteBase', {
  'Default settings': () => <AutocompleteBase />,

  'With suggestions': () => {
    return <AutocompleteBase suggestions={suggestions} />
  },

  'With initialValue': () => {
    return <AutocompleteBase initialValue="f" suggestions={suggestions} />
  },

  'With additional props': () => {
    return (
      <AutocompleteBase initialValue="t" suggestions={suggestions} fullWidth />
    )
  },
})

import React from 'react'
import ListTableSelect from 'core/common/list_table/ListTableSelect'
import { action } from '@storybook/addon-actions'
import { addStoriesFromModule } from '../helpers'

const addStories = addStoriesFromModule(module)
const onChange = action('change')

const columns = [
  { id: 'id', label: 'integer' },
  { id: 'word', label: 'word' },
]

const data = [
  { id: 1, word: 'one' },
  { id: 2, word: 'two' },
  { id: 3, word: 'three' },
]

addStories('Common Components/ListTableSelect', {
  'Minimal use case': () => (
    <ListTableSelect columns={columns} data={data} onChange={onChange} />
  ),

  'w/ initialValue set': () => (
    <ListTableSelect columns={columns} data={data} onChange={onChange} initialValue={data[1]} />
  )
})

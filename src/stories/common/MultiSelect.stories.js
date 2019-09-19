import React, { useState } from 'react'
import { addStoriesFromModule } from '../helpers'
import MultiSelect from 'core/components/MultiSelect'

const addStories = addStoriesFromModule(module)

addStories('Common Components/MultiSelect', {
  'with options': () => {
    const [values, setValues] = useState(['A'])
    const options = [
      { value: 'A', label: 'Option A' },
      { value: 'B', label: 'Option B' },
    ]

    return (
      <MultiSelect
        label='Select one or more option'
        options={options}
        values={values}
        onChange={setValues}
      />
    )
  },
})

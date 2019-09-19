import React, { useState } from 'react'
import { addStoriesFromModule } from '../helpers'
import MultiSelect from 'core/components/MultiSelect'

const addStories = addStoriesFromModule(module)

addStories('Common Components/MultiSelect', {
  'countries': () => {
    const [values, setValues] = useState(['A'])
    const options = [
      { value: 'Argentina', label: 'Argentina' },
      { value: 'Brazil', label: 'Brazil' },
      { value: 'Canada', label: 'Canada' },
      { value: 'Denmark', label: 'Denmark' },
      { value: 'England', label: 'England' },
      { value: 'France', label: 'France' },
      { value: 'Germany', label: 'Germany' },
      { value: 'Holland', label: 'Holland' },
      { value: 'India', label: 'India' },
      { value: 'Japan', label: 'Japan' },
      { value: 'Kenya', label: 'Kenya' },
      { value: 'Lithuania', label: 'Lithuania' },
      { value: 'Marocco', label: 'Marocco' },
    ]

    return (
      <MultiSelect
        label='Select one or more option'
        options={options}
        values={values}
        onChange={setValues}
        maxOptions={9}
      />
    )
  },
})

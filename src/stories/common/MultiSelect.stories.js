import React, { useState } from 'react'
import { addStoriesFromModule } from '../helpers'
import MultiSelect from 'core/components/MultiSelect'

const addStories = addStoriesFromModule(module)

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

addStories('Common Components/MultiSelect', {
  default: () => {
    const [values, setValues] = useState([])

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

addStories('Common Components/MultiSelect', {
  maxOptions: () => {
    const [values, setValues] = useState([])

    return (
      <MultiSelect
        label='Select one or more option'
        options={options}
        values={values}
        onChange={setValues}
        maxOptions={5}
      />
    )
  },
})

addStories('Common Components/MultiSelect', {
  sortSelectedFirst: () => {
    const [values, setValues] = useState([])

    return (
      <MultiSelect
        label='Select one or more option'
        options={options}
        values={values}
        onChange={setValues}
        sortSelectedFirst
      />
    )
  },
})

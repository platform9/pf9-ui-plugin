import React from 'react'
import 'app/app.css'
import AppContext from 'core/AppContext'
import ThemeManager from 'app/ThemeManager'
import { ToastProvider } from 'core/providers/ToastProvider'
import { decorateAction } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'

const objToJsonDetails = obj => JSON.stringify(obj, null, 4)
const isArray = x => x instanceof Array
const isObject = x => typeof x === 'object' && !isArray(x)

export const jsonDetailLogger = decorateAction([
  args => args.map(x => (isObject(x) ? objToJsonDetails(x) : x)),
])

export const pf9Decorators = storyFn => (
  <div style={{ margin: '16px' }}>
    <AppContext>
      <ThemeManager>
        <ToastProvider>
          {storyFn()}
        </ToastProvider>
      </ThemeManager>
    </AppContext>
  </div>
)

export const addStory = (section, subsection, story, mod) =>
  storiesOf(section, mod)
    .add(subsection, story)

export const addStories = (section, stories, mod) =>
  Object.entries(stories).forEach(([subsection, story]) =>
    addStory(section, subsection, story, mod),
  )

export const addStoriesFromModule = mod =>
  (section, stories) => addStories(section, stories, mod)

export const range = n => {
  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(i)
  }
  return arr
}

export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min)

export const randomItem = arr =>
  arr[randomInt(0, arr.length - 1)]

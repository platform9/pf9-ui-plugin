import React from 'react'

import { decorateAction } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import 'app/app.css'
import { withTheme } from 'app/theme'
import { compose } from 'core/../app/util/fp'
import AppContext, { withAppContext } from 'core/AppContext'
import HotKeysContext from 'core/providers/HotKeysProvider'
import { ToastProvider } from 'core/providers/ToastProvider'

const objToJsonDetails = obj => JSON.stringify(obj, null, 4)
const isArray = x => x instanceof Array
const isObject = x => typeof x === 'object' && !isArray(x)

export const jsonDetailLogger = decorateAction([
  args => args.map(x => (isObject(x) ? objToJsonDetails(x) : x)),
])

export const withWrappings = Component =>
  compose(
    withTheme,
    withAppContext,
  )(Component)

const Pf9StoryWrapper = withWrappings(({ children }) => <div>{children}</div>)

export const pf9Decorators = storyFn => (
  <HotKeysContext>
    <AppContext>
      <ToastProvider>
        <Pf9StoryWrapper>{storyFn()}</Pf9StoryWrapper>
      </ToastProvider>
    </AppContext>
  </HotKeysContext>
)

export const addStory = (section, subsection, story, mod) =>
  storiesOf(section, mod)
    .add(subsection, story)

export const addStories = (section, stories, mod) =>
  Object.entries(stories).forEach(([subsection, story]) =>
    addStory(section, subsection, story, mod)
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

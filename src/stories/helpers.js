import React from 'react'
import { storiesOf } from '@storybook/react'
import { decorateAction } from '@storybook/addon-actions'
import { withInfo } from '@storybook/addon-info'
import { withKnobs } from '@storybook/addon-knobs'
import StoryRouter from 'storybook-react-router'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { withTheme } from 'app/theme'

import 'app/app.css'

const objToJsonDetails = obj => JSON.stringify(obj, null, 4)
const isArray = x => x instanceof Array
const isObject = x => (typeof x === 'object') && !isArray(x)

export const jsonDetailLogger = decorateAction([
  args => args.map(x => isObject(x) ? objToJsonDetails(x) : x)
])

export const withWrappings = Component => compose(
  withTheme,
  withAppContext,
)(Component)

const Pf9StoryWrapper = withWrappings(({ children }) => (<div>{ children }</div>))

export const pf9Decorators = storyFn => (<Pf9StoryWrapper>{ storyFn() }</Pf9StoryWrapper>)

export const addStory = (section, subsection, story) =>
  storiesOf(section, module)
    .addDecorator(withKnobs)
    .addDecorator(StoryRouter())
    .addDecorator(pf9Decorators)
    .add(subsection, withInfo()(story))

export const addStories = (section, stories) =>
  Object.entries(stories).forEach(
    ([subsection, story]) => addStory(section, subsection, story)
  )

export const range = n => {
  let arr = []
  for (let i=0; i<n; i++) {
    arr.push(i)
  }
  return arr
}

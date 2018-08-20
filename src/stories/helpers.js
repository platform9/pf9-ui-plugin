import { storiesOf } from '@storybook/react'
import { decorateAction } from '@storybook/addon-actions'
import { withInfo } from '@storybook/addon-info'
import { withKnobs } from '@storybook/addon-knobs'
import StoryRouter from 'storybook-react-router'

const objToJsonDetails = obj => JSON.stringify(obj, null, 4)
const isArray = x => x instanceof Array
const isObject = x => (typeof x === 'object') && !isArray(x)

export const jsonDetailLogger = decorateAction([
  args => args.map(x => isObject(x) ? objToJsonDetails(x) : x)
])

export const withDefaults = (...args) => withInfo()(...args)

export const addStory = (section, subsection, story) =>
  storiesOf(section, module)
    .addDecorator(withKnobs)
    .addDecorator(StoryRouter())
    .add(subsection, withDefaults(story))

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

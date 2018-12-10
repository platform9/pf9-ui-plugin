import { addDecorator, configure } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import { withKnobs } from '@storybook/addon-knobs'
import StoryRouter from 'storybook-react-router'
import { pf9Decorators } from './helpers'

const req = require.context('.', true, /\.stories\.js$/)

function loadStories () {
  req.keys().forEach(filename => req(filename))
}

addDecorator(
  withInfo({
    header: false,
    inline: true,
    source: true,
  })
)
addDecorator(withKnobs)
addDecorator(StoryRouter())
addDecorator(pf9Decorators)

configure(loadStories, module)

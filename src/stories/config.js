import StoryRouter from 'storybook-react-router'
import { addDecorator, addParameters, configure } from '@storybook/react'
import { appDecorators } from './helpers'
import { create } from '@storybook/theming'
import { withInfo } from '@storybook/addon-info'
import { withKnobs } from '@storybook/addon-knobs'
import '../app/bootstrap'

addDecorator(withInfo({ header: false, inline: true, source: true }))
addDecorator(withKnobs)
addDecorator(StoryRouter())
addDecorator(appDecorators)

const storybookTheme = create({
  base: 'light',

  brandTitle: 'Platform9 Storybook',
  brandUrl: 'https://platform9.com',
  brandImage: 'https://hostadvice.com/wp-content/uploads/2017/07/Platform9-LogoStacked-777x352.png',

  // Typography
  fontBase: 'Roboto, sans-serif',
  fontCode: 'monospace',

  appBg: '#fafafa',
  appContentBg: '#fff',

  // Below are the default values for the light theme
  /*
  colorPrimary: '#ff4785',
  colorSecondary: '#1ea7df',

  // UI
  appBorderColor: 'rgba(0,0,0,.1)',
  appBorderRadius: 4,

  // Text colors
  textColor: '#333',
  textInverseColor: 'rgba(255,255,255,0.9)',

  // Toolbar default and active colors
  barTextColor: '#999999',
  barSelectedColor: '#1ea7fd',
  barBg: '#fff',

  // Form colors
  inputBg: '#fff',
  inputBorder: 'rgba(0, 0, 0, 0.1)',
  inputTextColor: '#333',
  inputBorderRadius: 4,
  */
})

addParameters({
  options: {
    theme: storybookTheme
  }
})

const req = require.context('.', true, /\.stories\.js$/)

function loadStories () {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)

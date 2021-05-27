import { AppPlugins } from 'app/constants'
import defaultTheme from 'core/themes/relianceLight'
import { ThemeConfig } from './model'
import { path } from 'ramda'

export const componentUpdaterObject = (themePath, value) => {
  return {
    pathTo: themePath,
    value: value || path(['components', ...themePath], defaultTheme),
  }
}

export const generateThemeUpdatePayload = ({ headerColor, sidenavColor }: ThemeConfig) => {
  return {
    components: [
      componentUpdaterObject(['header', 'background'], headerColor),
      componentUpdaterObject(['sidebar', AppPlugins.MyAccount, 'background'], sidenavColor),
      componentUpdaterObject(['sidebar', AppPlugins.Kubernetes, 'background'], sidenavColor),
      componentUpdaterObject(['sidebar', AppPlugins.OpenStack, 'background'], sidenavColor),
      componentUpdaterObject(['sidebar', AppPlugins.BareMetal, 'background'], sidenavColor),
    ],
  }
}

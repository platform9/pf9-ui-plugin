import defaultTheme from 'core/themes/relianceLight'

export const componentUpdaterObject = (path, value) => {
  return {
    pathTo: path,
    value: value || path(['components', ...path], defaultTheme),
  }
}

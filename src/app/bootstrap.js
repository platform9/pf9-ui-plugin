// Workaround for an issue with the order of imports when using certain tools
// (eg. Storybook), This method ensures the proper loading order of the jss styles
// It is necessary to load this file before anything else in the app
// Sadly, this is no longer mentioned in the official documentation, but there is some feedback from the community:
// https://github.com/mui-org/material-ui/issues/14348
import { install } from '@material-ui/styles'

install()

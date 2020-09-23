import React from 'react'
import { TextField as MUITextField } from '@material-ui/core'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles<Theme, { themeColor: string }>((theme: Theme) => ({
  // '@keyframes autofill': {
  //   '0%': {
  //     background: ({ themeColor }) =>
  //       themeColor === 'dark' ? theme.palette.grey[900] : theme.palette.grey['000'],
  //     color: ({ themeColor }) =>
  //       themeColor === 'dark' ? theme.palette.grey['000'] : theme.palette.grey[900],
  //   },
  //   '100%': {
  //     background: ({ themeColor }) =>
  //       themeColor === 'dark' ? theme.palette.grey[900] : theme.palette.grey['000'],
  //     color: ({ themeColor }) =>
  //       themeColor === 'dark' ? theme.palette.grey['000'] : theme.palette.grey[900],
  //   },
  // },
  input: {
    '& .MuiFormLabel-root': {
      ...theme.typography.inputLabel,
    },
    '& input': {
      ...theme.typography.inputPlaceholder,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: ({ themeColor }) =>
        `1px solid ${themeColor === 'dark' ? theme.palette.grey['000'] : theme.palette.grey[900]}`,
    },
    '& input:-webkit-autofill': {
      'animation-delay': '.5s' /* Safari support - any positive time runs instantly */,
      'animation-name': '$autofill',
      'animation-fill-mode': 'both',
    },
  },
}))

function TextField({ className = undefined, themeColor = 'dark', ...rest }) {
  const { input } = useStyles({ themeColor })
  return <MUITextField {...rest} variant="outlined" className={clsx(input, className)} />
}

export default TextField

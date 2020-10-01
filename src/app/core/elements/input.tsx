import React, { FC } from 'react'
import { OutlinedTextFieldProps, TextField as MUITextField } from '@material-ui/core'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'

const colorVariantMap = {
  light: {
    color: 800,
    background: '000',
  },
  dark: {
    color: '000',
    background: 800,
  },
}
function getColor(theme, key, variant) {
  const colorKey = colorVariantMap[variant][key]
  return theme.palette.grey[colorKey]
}

interface Props extends Omit<OutlinedTextFieldProps, 'onChange' | 'variant'> {
  variant?: 'light' | 'dark'
  onChange?: (e: any) => void
}

const Input: FC<Props> = ({ className = undefined, variant = 'light', ...rest }) => {
  const { input } = useStyles({ variant })
  return <MUITextField {...rest} variant="outlined" className={clsx(input, className)} />
}

const useStyles = makeStyles<Theme, { variant: string }>((theme: Theme) => ({
  input: {
    '& .MuiInputLabel-outlined': {
      textTransform: 'uppercase',
      top: 3,
      ...theme.typography.inputLabel,
      color: theme.palette.grey[500],
      backgroundColor: ({ variant }) => getColor(theme, 'background', variant),
    },
    '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
      ...theme.typography.inputLabel,
      top: -3,
      fontSize: 15,
      padding: '0 12px 0 5px',
      color: ({ variant }) => getColor(theme, 'color', variant),
    },
    '& input': {
      ...theme.typography.inputTable,
      minHeight: 54,
      padding: theme.spacing(0, 2),
      color: ({ variant }) => getColor(theme, 'color', variant),
      background: ({ variant }) => getColor(theme, 'background', variant),

      '&:-webkit-autofill': {
        '-webkit-text-fill-color': ({ variant }) => getColor(theme, 'color', variant),
        '-webkit-box-shadow': ({ variant }) =>
          `0 0 0 30px ${getColor(theme, 'background', variant)} inset !important`,
      },
      '&:-webkit-autofill:hover': {
        '-webkit-text-fill-color': ({ variant }) => getColor(theme, 'color', variant),
        '-webkit-box-shadow': ({ variant }) =>
          `0 0 0 30px ${getColor(theme, 'background', variant)} inset !important`,
      },
      '&:-webkit-autofill:focus': {
        '-webkit-text-fill-color': ({ variant }) => getColor(theme, 'color', variant),
        '-webkit-box-shadow': ({ variant }) =>
          `0 0 0 30px ${getColor(theme, 'background', variant)} inset !important`,
      },
      '&:-webkit-autofill:active': {
        '-webkit-text-fill-color': ({ variant }) => getColor(theme, 'color', variant),
        '-webkit-box-shadow': ({ variant }) =>
          `0 0 0 30px ${getColor(theme, 'background', variant)} inset !important`,
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: 0,
      border: ({ variant }) => `1px solid ${getColor(theme, 'color', variant)}`,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: ({ variant }) => getColor(theme, 'color', variant),
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: ({ variant }) => getColor(theme, 'color', variant),
    },
  },
}))

export default Input

import React, { FC } from 'react'
import { OutlinedTextFieldProps, TextField as MUITextField } from '@material-ui/core'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'

const colorVariantMap = (theme: Theme) => ({
  light: {
    default: {
      color: theme.palette.grey[900],
      background: theme.palette.grey['000'],
    },
    focus: {
      color: theme.palette.blue[500],
      background: theme.palette.grey['000'],
    },
    error: {
      color: theme.palette.osRed[500],
      background: theme.palette.grey['000'],
    },
    disabled: {
      color: theme.palette.grey[300],
      background: theme.palette.grey['000'],
    },
  },
  dark: {
    default: {
      background: theme.palette.grey[800],
      color: theme.palette.grey['000'],
    },
    focus: {
      color: theme.palette.blue[500],
      background: theme.palette.grey['800'],
    },
    error: {
      background: theme.palette.grey[800],
      color: theme.palette.osRed['500'],
    },
    disabled: {
      background: theme.palette.grey[800],
      color: theme.palette.grey['700'],
    },
  },
})
const getColor = (theme, key = 'default', variant) => colorVariantMap(theme)[variant][key]

interface Props extends Omit<OutlinedTextFieldProps, 'onChange' | 'variant'> {
  variant?: 'light' | 'dark'
  onChange?: (e: any) => void
}

const Input: FC<Props> = ({ className = undefined, variant = 'light', children, ...rest }) => {
  const { input } = useStyles({ variant })
  return (
    <MUITextField {...rest} variant="outlined" className={clsx(input, className)}>
      {children}
    </MUITextField>
  )
}

const useStyles = makeStyles<Theme, { variant: string }>((theme: Theme) => ({
  input: {
    '& .MuiInputLabel-outlined': {
      textTransform: 'uppercase',
      top: -3,
      ...theme.typography.inputLabel,
      color: theme.palette.grey[500],
      backgroundColor: ({ variant }) => getColor(theme, 'default', variant).background,
    },
    '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
      ...theme.typography.inputLabel,
      top: -3,
      fontSize: 15,
      padding: '0 12px 0 5px',
      color: ({ variant }) => getColor(theme, 'default', variant).color,
    },
    '& .MuiSelect-selectMenu': {
      minHeight: 40,
      lineHeight: '40px',
      padding: theme.spacing(0, 2),
      color: ({ variant }) => getColor(theme, 'default', variant).color,
      background: ({ variant }) => getColor(theme, 'default', variant).background,
    },
    '& .MuiSelect-icon': {
      color: ({ variant }) => getColor(theme, 'default', variant).color,
      background: ({ variant }) => getColor(theme, 'default', variant).background,
    },
    '& input': {
      ...theme.typography.inputPlaceholder,
      fontSize: 14,
      minHeight: 40,
      padding: theme.spacing(0, 2),
      color: ({ variant }) => getColor(theme, 'default', variant).color,
      background: ({ variant }) => getColor(theme, 'default', variant).background,

      '&:-webkit-autofill': {
        '-webkit-text-fill-color': ({ variant }) => getColor(theme, 'default', variant).color,
        '-webkit-box-shadow': ({ variant }) =>
          `0 0 0 30px ${getColor(theme, 'default', variant).background} inset !important`,
      },
      '&:-webkit-autofill:hover': {
        '-webkit-text-fill-color': ({ variant }) => getColor(theme, 'default', variant).color,
        '-webkit-box-shadow': ({ variant }) =>
          `0 0 0 30px ${getColor(theme, 'default', variant).background} inset !important`,
      },
      '&:-webkit-autofill:focus': {
        '-webkit-text-fill-color': ({ variant }) => getColor(theme, 'default', variant).color,
        '-webkit-box-shadow': ({ variant }) =>
          `0 0 0 30px ${getColor(theme, 'default', variant).background} inset !important`,
      },
      '&:-webkit-autofill:active': {
        '-webkit-text-fill-color': ({ variant }) => getColor(theme, 'default', variant).color,
        '-webkit-box-shadow': ({ variant }) =>
          `0 0 0 30px ${getColor(theme, 'default', variant).background} inset !important`,
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: 0,
      border: ({ variant }) => `1px solid ${getColor(theme, 'default', variant).color}`,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: ({ variant }) => getColor(theme, 'default', variant).color,
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 1,
      borderColor: ({ variant }) => `${getColor(theme, 'focus', variant).color} !important`,
    },
    '& .Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: ({ variant }) => `${getColor(theme, 'error', variant).color} !important`,
    },
    '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderColor: ({ variant }) => `${getColor(theme, 'disabled', variant).color} !important`,
    },
    '& .Mui-disabled.MuiInputLabel-outlined': {
      color: ({ variant }) => `${getColor(theme, 'disabled', variant).color} !important`,
    },
  },
}))

export default Input

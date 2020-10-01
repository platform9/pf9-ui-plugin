import React from 'react'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
import Text, { TextVariant } from './text'
import { ButtonProps } from '@material-ui/core'

interface Props extends Omit<ButtonProps, 'variant'> {
  color?: 'primary' | 'secondary'
  variant?: 'light' | 'dark'
  textVariant?: TextVariant
  children: string
}

const Button = ({
  color,
  variant = 'light',
  textVariant,
  className = undefined,
  children,
}: Props) => {
  const { button } = useStyles({ variant, color })
  return (
    <button className={clsx(button, className)}>
      <Text
        component="span"
        variant={textVariant || color === 'primary' ? 'buttonPrimary' : 'buttonSecondary'}
      >
        {children}
      </Text>
    </button>
  )
}

const colorVariantMap = (theme: Theme) => ({
  light: {
    primary: {
      default: {
        backgroundColor: theme.palette.blue[500],
        color: theme.palette.grey['000'],
      },
      hover: {
        backgroundColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      active: {
        backgroundColor: theme.palette.blue[700],
        color: theme.palette.grey['000'],
      },
      focus: {
        backgroundColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      disabled: {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.grey['500'],
      },
    },
    secondary: {
      default: {
        backgroundColor: theme.palette.blue[500],
        color: theme.palette.grey['000'],
      },
      hover: {
        backgroundColor: theme.palette.blue[300],
        color: theme.palette.grey['000'],
      },
      active: {
        backgroundColor: theme.palette.blue[700],
        color: theme.palette.grey['000'],
      },
      focus: {
        backgroundColor: theme.palette.blue[300],
        color: theme.palette.grey['000'],
      },
      disabled: {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.grey['500'],
      },
    },
  },
  dark: {
    primary: {
      default: {
        backgroundColor: theme.palette.blue[500],
        color: theme.palette.grey['900'],
      },
      hover: {
        backgroundColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      active: {
        backgroundColor: theme.palette.blue[700],
        color: theme.palette.grey['900'],
      },
      focus: {
        backgroundColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      disabled: {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.grey['500'],
      },
    },
    secondary: {
      default: {
        backgroundColor: theme.palette.blue[500],
        color: theme.palette.grey['900'],
      },
      hover: {
        backgroundColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      active: {
        backgroundColor: theme.palette.blue[700],
        color: theme.palette.grey['900'],
      },
      focus: {
        backgroundColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      disabled: {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.grey['500'],
      },
    },
  },
})
const getColor = (theme, key, color, variant) => colorVariantMap(theme)[variant][color][key]

const useStyles = makeStyles<Theme, { color: string; variant: string }>((theme: Theme) => ({
  button: {
    outline: 0,
    border: 'none',
    minHeight: 54,
    transition: 'background 0.2s ease, color 0.2s ease',
    backgroundColor: ({ color, variant }) =>
      getColor(theme, 'default', color, variant).backgroundColor,
    color: ({ color, variant }) => getColor(theme, 'default', color, variant).color,

    '&:hover': {
      backgroundColor: ({ color, variant }) =>
        getColor(theme, 'hover', color, variant).backgroundColor,
      color: ({ color, variant }) => getColor(theme, 'hover', color, variant).color,
    },
    '&:active': {
      backgroundColor: ({ color, variant }) =>
        `${getColor(theme, 'active', color, variant).backgroundColor} !important`,
      color: ({ color, variant }) =>
        `${getColor(theme, 'active', color, variant).color} !important`,
    },
    '&:focus': {
      outline: 1,
      backgroundColor: ({ color, variant }) =>
        getColor(theme, 'focus', color, variant).backgroundColor,
      color: ({ color, variant }) => getColor(theme, 'focus', color, variant).color,
    },
    '&.disabled': {
      backgroundColor: ({ color, variant }) =>
        getColor(theme, 'disabled', color, variant).backgroundColor,
      color: ({ color, variant }) => getColor(theme, 'disabled', color, variant).color,
    },
  },
}))

export default Button

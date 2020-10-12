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
  disabled?: boolean
}

const Button = ({
  color = 'primary',
  variant = 'light',
  textVariant = undefined,
  className = undefined,
  children,
  disabled = false,
  ...rest
}: Props) => {
  const { button, centerText } = useStyles({ variant, color })
  const spanTextVariant = textVariant || color === 'primary' ? 'buttonPrimary' : 'buttonSecondary'
  return (
    <button className={clsx(button, className, { disabled })} {...rest}>
      <Text className={centerText} component="span" variant={spanTextVariant}>
        {children}
      </Text>
    </button>
  )
}

const useStyles = makeStyles<Theme, { color: string; variant: string }>((theme: Theme) => ({
  centerText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    cursor: 'pointer',
    outline: 0,
    minHeight: 40,
    // minWidth: 150,
    transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
    padding: theme.spacing(0, 2),
    border: '1px solid transparent',
    backgroundColor: ({ color, variant }) =>
      getColor(theme, 'default', color, variant).backgroundColor,
    color: ({ color, variant }) => getColor(theme, 'default', color, variant).color,
    borderColor: ({ color, variant }) => getColor(theme, 'default', color, variant).borderColor,

    '&:hover': {
      backgroundColor: ({ color, variant }) =>
        getColor(theme, 'hover', color, variant).backgroundColor,
      borderColor: ({ color, variant }) => getColor(theme, 'hover', color, variant).borderColor,
      color: ({ color, variant }) => getColor(theme, 'hover', color, variant).color,
    },
    '&:active': {
      backgroundColor: ({ color, variant }) =>
        `${getColor(theme, 'active', color, variant).backgroundColor} !important`,
      borderColor: ({ color, variant }) =>
        `${getColor(theme, 'active', color, variant).borderColor} !important`,
      color: ({ color, variant }) =>
        `${getColor(theme, 'active', color, variant).color} !important`,
    },
    '&:focus': {
      outline: `2px solid ${theme.palette.blue[700]}`,
      outlineOffset: 3,
      backgroundColor: ({ color, variant }) =>
        getColor(theme, 'focus', color, variant).backgroundColor,
      borderColor: ({ color, variant }) => getColor(theme, 'focus', color, variant).borderColor,
      color: ({ color, variant }) => getColor(theme, 'focus', color, variant).color,
    },
    '&.disabled': {
      cursor: 'not-allowed',
      outline: 0,
      backgroundColor: ({ color, variant }) =>
        `${getColor(theme, 'disabled', color, variant).backgroundColor} !important`,
      borderColor: ({ color, variant }) =>
        `${getColor(theme, 'disabled', color, variant).borderColor} !important`,
      color: ({ color, variant }) =>
        `${getColor(theme, 'disabled', color, variant).color} !important`,
    },
  },
}))

const colorVariantMap = (theme: Theme) => ({
  light: {
    primary: {
      default: {
        backgroundColor: theme.palette.blue[500],
        borderColor: theme.palette.blue[500],
        color: theme.palette.grey['000'],
      },
      hover: {
        backgroundColor: theme.palette.blue[300],
        borderColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      active: {
        backgroundColor: theme.palette.blue[700],
        borderColor: theme.palette.blue[700],
        color: theme.palette.grey['000'],
      },
      focus: {
        backgroundColor: theme.palette.blue[300],
        borderColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      disabled: {
        backgroundColor: theme.palette.grey[300],
        borderColor: theme.palette.grey[300],
        color: theme.palette.grey['500'],
      },
    },
    secondary: {
      default: {
        backgroundColor: 'transparent',
        borderColor: theme.palette.blue[900],
        color: theme.palette.grey['900'],
      },
      hover: {
        backgroundColor: theme.palette.grey[700],
        borderColor: theme.palette.grey[700],
        color: theme.palette.grey['000'],
      },
      active: {
        backgroundColor: theme.palette.grey[900],
        borderColor: theme.palette.grey[900],
        color: theme.palette.grey['000'],
      },
      focus: {
        backgroundColor: theme.palette.grey[700],
        borderColor: theme.palette.grey[700],
        color: theme.palette.grey['000'],
      },
      disabled: {
        backgroundColor: 'transparent',
        borderColor: theme.palette.grey[300],
        color: theme.palette.grey['500'],
      },
    },
  },
  dark: {
    primary: {
      default: {
        backgroundColor: theme.palette.blue[500],
        borderColor: theme.palette.blue[500],
        color: theme.palette.grey['900'],
      },
      hover: {
        backgroundColor: theme.palette.blue[300],
        borderColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      active: {
        backgroundColor: theme.palette.blue[700],
        borderColor: theme.palette.blue[700],
        color: theme.palette.grey['900'],
      },
      focus: {
        backgroundColor: theme.palette.blue[300],
        borderColor: theme.palette.blue[300],
        color: theme.palette.grey['900'],
      },
      disabled: {
        backgroundColor: theme.palette.grey[300],
        borderColor: theme.palette.grey[300],
        color: theme.palette.grey['500'],
      },
    },
    secondary: {
      default: {
        backgroundColor: 'transparent',
        borderColor: theme.palette.blue[500],
        color: theme.palette.grey['000'],
      },
      hover: {
        backgroundColor: 'transparent',
        borderColor: theme.palette.grey['000'],
        color: theme.palette.blue['500'],
      },
      active: {
        backgroundColor: theme.palette.blue[700],
        borderColor: theme.palette.grey['000'],
        color: theme.palette.grey['000'],
      },
      focus: {
        backgroundColor: 'transparent',
        borderColor: theme.palette.grey['000'],
        color: theme.palette.blue['500'],
      },
      disabled: {
        backgroundColor: 'transparent',
        borderColor: theme.palette.grey[700],
        color: theme.palette.grey['500'],
      },
    },
  },
})
const getColor = (theme, key, color, variant) => colorVariantMap(theme)[variant][color][key]

export default Button

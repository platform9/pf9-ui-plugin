import React, { FC } from 'react'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
import { ButtonProps } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

interface Props extends Omit<ButtonProps, 'variant'> {
  disabled?: boolean
  icon?: string
}

const IconButton: FC<Props> = ({
  className = undefined,
  icon = undefined,
  children,
  disabled = false,
  ...props
}) => {
  const classes = useStyles({})
  return (
    <button className={clsx(classes.button, className, { disabled })} {...props}>
      <FontAwesomeIcon className={classes.icon} size="2x">
        {icon || children}
      </FontAwesomeIcon>
    </button>
  )
}

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 30,
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.palette.blue[500],
    cursor: 'pointer',

    '&:hover': {
      color: theme.palette.blue[700],
    },
    '&:focus': {
      outline: `2px solid ${theme.palette.blue[700]}`,
      outlineOffset: 3,
    },
  },
  icon: {
    color: 'inherit',
  },
}))

export default IconButton

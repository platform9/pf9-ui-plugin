import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import clsx from 'clsx'

interface Props {
  displayName: string
  diameter?: number
  fontSize?: number
  onClick?: any
  className?: string
}

const useStyles = makeStyles<Theme, Partial<Props>>((theme: Theme) => ({
  avatar: {
    borderRadius: '50%',
    background: theme.palette.grey[200],
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    textTransform: 'uppercase',
    fontWeight: 600,
    height: ({ diameter }) => diameter,
    width: ({ diameter }) => diameter,
    fontSize: ({ fontSize }) => fontSize,
    cursor: ({ onClick }) => (!!onClick ? 'pointer' : 'default'),
  },
}))

const Avatar = ({ displayName, diameter = 48, fontSize = 18, onClick, className }: Props) => {
  const { avatar } = useStyles({ diameter, fontSize, onClick })

  return (
    <div className={clsx(avatar, className)} onClick={onClick}>
      {displayName.charAt(0)}
    </div>
  )
}

export default Avatar

// Libs
import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import Text from 'core/elements/text'

interface Props {
  message?: string
  defaultHeight?: number
  variant: 'dark' | 'light'
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
  messageContainer: {
    marginTop: theme.spacing(2),
    backgroundColor: ({ variant }) => theme.palette.grey[variant === 'dark' ? 100 : '000'],
    minHeight: ({ defaultHeight }) => `${defaultHeight}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  messageTitle: {
    color: theme.palette.grey[700],
  },
}))

const NoContentMessage: FC<Props> = ({
  children,
  message,
  defaultHeight = 200,
  variant = 'dark',
}) => {
  const { messageContainer, messageTitle } = useStyles({ defaultHeight, variant })
  return (
    <div className={messageContainer}>
      {message ? (
        <Text className={messageTitle} variant="subtitle2">
          {message}
        </Text>
      ) : (
        children
      )}
    </div>
  )
}

export default NoContentMessage

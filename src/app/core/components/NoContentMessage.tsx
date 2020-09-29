// Libs
import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import Text from 'core/elements/text'

interface Props {
  message?: string
  defaultHeight?: number
}

const useStyles = makeStyles<Theme, { height: number }>((theme) => ({
  messageContainer: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    minHeight: ({ height }) => `${height}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  messageTitle: {
    color: theme.palette.grey[700],
  },
}))

const NoContentMessage: FC<Props> = ({ children, message, defaultHeight = 200 }) => {
  const { messageContainer, messageTitle } = useStyles({ height: defaultHeight })
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

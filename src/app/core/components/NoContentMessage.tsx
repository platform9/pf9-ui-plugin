// Libs
import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import Text from 'core/elements/text'
// Helpers
import { hexToRGBA } from 'core/utils/colorHelpers'

interface Props {
  message?: string
  defaultHeight?: number
}

const useStyles = makeStyles<Theme, { height: number }>((theme) => ({
  messageContainer: {
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
    minHeight: ({ height }) => `${height}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.25rem',
    border: `1px solid ${hexToRGBA(theme.palette.primary.main, 0.5)}`,
    borderRadius: '5px',
  },
  messageTitle: {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}))

const NoContentMessage: FC<Props> = ({ children, message, defaultHeight = 300 }) => {
  const { messageContainer, messageTitle } = useStyles({ height: defaultHeight })
  return (
    <div className={messageContainer}>
      {message ? (
        <Text className={messageTitle} variant="h6">
          {message}
        </Text>
      ) : (
        children
      )}
    </div>
  )
}

export default NoContentMessage

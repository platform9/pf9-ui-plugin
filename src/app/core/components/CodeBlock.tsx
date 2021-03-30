import React, { FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { hexToRGBA } from 'core/utils/colorHelpers'

interface Props {
  fill?: boolean
  className?: any
  children: any
}

interface StyleProps {
  fill?: boolean
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  pre: {
    fontWeight: 600,
    fontFamily: 'monospace',
    display: ({ fill }) => (fill ? 'flex' : 'inline-block'),
    backgroundColor: theme.components.code.background,
    color: theme.components.code.text,
    padding: theme.spacing(),
    margin: theme.spacing(0.5),
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
    maxHeight: ({ fill }) => (fill ? 'initial' : 400),
    overflow: 'auto',
    flexGrow: ({ fill }) => (fill ? 1 : 0),

    '& *': {
      fontFamily: 'Courier',
    },
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: hexToRGBA(theme.palette.grey[500], 0.2),
      borderRadius: 2,
    },
  },
}))

const CodeBlock: FunctionComponent<Props> = ({ children, className, fill = false }) => {
  const styles = useStyles({ fill })

  return (
    <pre className={clsx(styles.pre, className)}>
      <code>{children}</code>
    </pre>
  )
}

export default CodeBlock

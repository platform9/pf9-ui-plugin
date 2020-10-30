import React, { FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import clsx from 'clsx'

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
    display: 'inline-block',
    backgroundColor: theme.components.code.background,
    color: theme.components.code.text,
    padding: theme.spacing(),
    margin: theme.spacing(0.5),
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
    maxHeight: 400,
    overflow: 'auto',
    flexGrow: ({ fill }) => (fill ? 1 : 0),

    '& *': {
      fontFamily: 'Courier',
    },
    '&::-webkit-scrollbar': {
      width: 0,
      background: 'transparent',
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

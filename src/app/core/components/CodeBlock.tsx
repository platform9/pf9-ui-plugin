import React, { FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

interface Props {
  fill?: boolean
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
    backgroundColor: theme.palette.code.background,
    color: theme.palette.code.text,
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

const CodeBlock: FunctionComponent<Props> = ({ children, fill = false }) => {
  const styles = useStyles({ fill })

  return (
    <pre className={styles.pre}>
      <code>{children}</code>
    </pre>
  )
}

export default CodeBlock

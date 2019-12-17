import React, { FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/styles'

import Theme from 'core/themes/model'
interface Props {
  children: any
}

const useStyles = makeStyles((theme: Theme) => ({
  pre: {
    display: 'inline-block',
    backgroundColor: theme.palette.code.background,
    color: theme.palette.code.text,
    padding: theme.spacing(1, 2),
    margin: theme.spacing(0.5),
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',

    '& *': {
      fontFamily: 'Courier'
    }
  }
}))

const CodeBlock: FunctionComponent<Props> = ({ children }) => {
  const styles = useStyles({})
  return <pre className={styles.pre}>{children}</pre>
}

export default CodeBlock

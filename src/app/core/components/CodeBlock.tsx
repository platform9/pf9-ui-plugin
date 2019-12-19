import React, { FunctionComponent } from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { hexToRGBA } from 'core/utils/colorHelpers'
import { useToast } from 'core/providers/ToastProvider'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { MessageTypes } from 'core/components/toasts/ToastItem'

interface Props {
  children: any
}

const useStyles = makeStyles((theme: Theme) => ({
  pre: {
    display: 'inline-block',
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.15),
    padding: `2px ${theme.spacing(1)}px`,
    margin: theme.spacing(0.5),
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
    cursor: 'copy',

    '& *': {
      fontFamily: 'Courier'
    }
  }
}))

const CodeBlock: FunctionComponent<Props> = ({ children }) => {
  const styles = useStyles({})
  const showToast = useToast()
  const handleOnCopy = () => showToast('Text copied to clipboard successfuly...', MessageTypes.success)

  return <CopyToClipboard text={children} onCopy={handleOnCopy}><pre className={styles.pre}>{children}</pre></CopyToClipboard>
}

export default CodeBlock

import React, { FunctionComponent, useRef } from 'react'
import { FileCopy, Done } from '@material-ui/icons'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/styles'
import useParams from 'core/hooks/useParams'

interface Props {
  copyText: string
  children: any
}

interface State {
  showCopyIcon: boolean
  isCopySuccessful: boolean
}

const defaultParams: State = {
  showCopyIcon: false,
  isCopySuccessful: false,
}

const useStyles = makeStyles(() => ({
  textArea: {
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
  },
  copyButton: {
    padding: '0 0 0 2px',
  }
}))

const CopyToClipboard: FunctionComponent<Props> = ({ children, copyText }) => {
  const { params, updateParams } = useParams<State>(defaultParams)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const classes = useStyles({})
  const handleOnMouseOver = () => updateParams({ showCopyIcon: true })
  const handleOnMouseLeave = () => updateParams({ showCopyIcon: false })
  const handleOnBlur = () => updateParams({ showCopyIcon: false, isCopySuccessful: false })
  const handleCopy = () => {
    try {
      const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false
      textAreaRef.current.select()
      const success = document.execCommand('copy')

      if (!success) {
        throw new Error('Unable to copy text')
      }

      if (selected) {
        document.getSelection().removeAllRanges()
        document.getSelection().addRange(selected)
      }

      updateParams({ isCopySuccessful: true, showCopyIcon: true })
    } catch (e) {
      console.log('Unable to copy text')
    }
  }

  return (<span onMouseOver={handleOnMouseOver} onMouseLeave={handleOnMouseLeave} onBlur={handleOnBlur}>
    <textarea ref={textAreaRef} value={copyText} className={classes.textArea} />
    {children}
    {params.showCopyIcon && <IconButton onClick={handleCopy} className={classes.copyButton}>
      {params.isCopySuccessful ? <Done /> : <FileCopy />}
    </IconButton>}
  </span>)
}

export default CopyToClipboard

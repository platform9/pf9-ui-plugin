import React, { FunctionComponent, useRef } from 'react'
import { Done } from '@material-ui/icons'
import { makeStyles } from '@material-ui/styles'
import useParams from 'core/hooks/useParams'
import Theme from 'core/themes/model'

interface Props {
  copyText: string
  children?: any
  inline?: boolean
  codeBlock?: boolean
  header?: string
  // fill property for if you want the copy to clipboard container to fill
  // the entire width of the parent, but still want the copy to clipboard
  // icon inline
  fill? : boolean
}

interface State {
  isCopySuccessful: boolean
}

const defaultParams: State = {
  isCopySuccessful: false,
}

interface StyleProps {
  codeBlock?: boolean
  inline?: boolean
  fill?: boolean
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  textArea: {
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
  },
  copyButton: {
    padding: '0 0 0 2px',
  },
  copyContainer: {
    display: ({ fill, inline }) => (fill ? 'flex' : inline ? 'inline-flex' : 'flex'),
    flexDirection: ({ inline }) => (inline ? 'row' : 'column'),
    background: ({ codeBlock }) => (codeBlock ? theme.palette.code.background : 'transparent'),
  },
  copyIconContainer: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    position: 'relative',
    '&:before': {
      content: ({ inline }) => (inline ? '""' : ''),
      position: 'absolute',
      top: theme.spacing(),
      bottom: theme.spacing(),
      left: 0,
      width: 1,
      background: ({ codeBlock }) => (codeBlock ? theme.palette.code.text : 'transparent'),
    },
  },
  copySvg: {
    verticalAlign: 'top',
    color: ({ codeBlock }) => (codeBlock ? theme.palette.code.text : 'rgb(38, 139, 210)'),
    marginLeft: '3px',
    height: '17px',
    width: '17px',
  },
  copySvgContainer: {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    color: theme.palette.wizard.dark,
  },
  header: {
    display: 'flex',
    color: theme.palette.code.text,
    position: 'relative',
    '& > p': {
      paddingLeft: 20,
      fontWeight: 'bold',
      fontSize: theme.typography.subtitle1.fontSize,
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: theme.spacing(2),
      right: theme.spacing(2),
      height: 1,
      background: ({ codeBlock }) => (codeBlock ? theme.palette.code.text : 'transparent'),
    },
  },
}))

const CopyToClipboard: FunctionComponent<Props> = ({
  children,
  copyText,
  inline = true,
  codeBlock = true,
  header = undefined,
  fill = false,
}) => {
  const { params, updateParams } = useParams<State>(defaultParams)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const classes = useStyles({ codeBlock, inline, fill })

  const handleCopy = () => {
    try {
      const selected =
        document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false
      textAreaRef.current.select()
      const success = document.execCommand('copy')

      if (!success) {
        throw new Error('Unable to copy text')
      }

      if (selected) {
        document.getSelection().removeAllRanges()
        document.getSelection().addRange(selected)
      }

      updateParams({ isCopySuccessful: true })
      setTimeout(() => {
        updateParams({ isCopySuccessful: false })
      }, 2000)
    } catch (e) {
      console.log('Unable to copy text')
    }
  }
  const copyActionElems = (
    <div className={classes.copyIconContainer} onClick={handleCopy}>
      {params.isCopySuccessful ? (
        <Done className={classes.done} />
      ) : (
        <CopyIcon codeBlock={codeBlock} />
      )}
    </div>
  )

  // readOnly is needed in textarea to silence React warning about missing onChange
  return (
    <div className={classes.copyContainer}>
      <textarea ref={textAreaRef} value={copyText} className={classes.textArea} readOnly />
      {!!header && (
        <div className={classes.header}>
          <p>{header}</p>
          {!inline && copyActionElems}
        </div>
      )}
      {children}
      {inline && copyActionElems}
    </div>
  )
}

export default CopyToClipboard

export const CopyIcon = ({ codeBlock }) => {
  const { copySvg, copySvgContainer } = useStyles({ codeBlock })
  return (
    <div className={copySvgContainer}>
      <svg
        viewBox="0 0 40 40"
        fill="currentColor"
        preserveAspectRatio="xMidYMid meet"
        className={copySvg}
      >
        <g>
          <path d="m30 35h-25v-22.5h25v7.5h2.5v-12.5c0-1.4-1.1-2.5-2.5-2.5h-7.5c0-2.8-2.2-5-5-5s-5 2.2-5 5h-7.5c-1.4 0-2.5 1.1-2.5 2.5v27.5c0 1.4 1.1 2.5 2.5 2.5h25c1.4 0 2.5-1.1 2.5-2.5v-5h-2.5v5z m-20-27.5h2.5s2.5-1.1 2.5-2.5 1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5 1.3 2.5 2.5 2.5h2.5s2.5 1.1 2.5 2.5h-20c0-1.5 1.1-2.5 2.5-2.5z m-2.5 20h5v-2.5h-5v2.5z m17.5-5v-5l-10 7.5 10 7.5v-5h12.5v-5h-12.5z m-17.5 10h7.5v-2.5h-7.5v2.5z m12.5-17.5h-12.5v2.5h12.5v-2.5z m-7.5 5h-5v2.5h5v-2.5z" />
        </g>
      </svg>
    </div>
  )
}

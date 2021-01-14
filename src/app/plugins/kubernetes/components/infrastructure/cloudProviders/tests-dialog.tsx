import Theme from 'core/themes/model'
import React, { useEffect, useState } from 'react'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import SubmitButton from 'core/components/buttons/SubmitButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'
import { Dialog, DialogActions, makeStyles } from '@material-ui/core'
import { hexToRGBA } from 'core/utils/colorHelpers'
import clsx from 'clsx'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  dialogContent: {
    margin: theme.spacing(0, 2, 1, 2),
  },
  tests: {
    display: 'grid',
    gridTemplateColumns: '48px 180px auto',
    margin: theme.spacing(1, 1, 2, 1),
  },
  subHeader: {
    color: theme.palette.common.black,
  },
  checkingText: {
    color: theme.palette.blue[500],
    fontStyle: 'italic',
    fontSize: '14px',
    paddingTop: '3px',
  },
  dialogActions: {
    justifyContent: 'flex-start',
    padding: theme.spacing(1),
  },
  loadingIcon: {
    color: theme.palette.blue[500],
    justifySelf: 'flex-start',
    paddingTop: theme.spacing(1),
  },
  successIcon: {
    color: theme.palette.green[500],
    justifySelf: 'flex-start',
    paddingTop: theme.spacing(1),
  },
  failIcon: {
    color: theme.palette.red[500],
    justifySelf: 'flex-start',
    paddingTop: theme.spacing(1),
  },
  errorIcon: {
    color: theme.palette.red[500],
    justifySelf: 'flex-start',
    paddingTop: theme.spacing(1),
  },
  error: {
    maxHeight: 224,
    padding: theme.spacing(1),
    margin: theme.spacing(2, 2, 1, 2),
    border: `1px solid ${theme.palette.red[500]}`,
    backgroundColor: hexToRGBA(theme.palette.red[500], 0.1),
    borderRadius: 4,

    '& > header': {
      color: theme.palette.red[500],
      display: 'grid',
      gridGap: theme.spacing(),
      gridTemplateColumns: '22px 1fr 22px',
      fontSize: 14,
      height: 40,
      alignItems: 'center',
    },
  },
}))

export enum TestStatus {
  Loading = 'loading',
  Success = 'success',
  Fail = 'fail',
}

const iconsMap = new Map<string, { icon: string; classes: string }>([
  ['loading', { icon: 'sync', classes: 'fa-spin' }],
  ['success', { icon: 'check-circle', classes: '' }],
  ['fail', { icon: 'times-circle', classes: '' }],
  ['error', { icon: 'exclamation-circle', classes: '' }],
])

const getIconClass = (status) =>
  ({
    loading: 'loadingIcon',
    success: 'successIcon',
    fail: 'failIcon',
  }[status])

interface Props {
  title: string
  link?: any
  subtitle: string
  testsCompletionMessage?: string
  tests: any
  errorMessage?: string
  showDialog: boolean
  onClose: any
}

const TestsDialog = ({
  title,
  link,
  subtitle,
  testsCompletionMessage,
  tests,
  errorMessage,
  showDialog,
  onClose,
}: Props) => {
  const classes = useStyles()
  const [testElements, setTestElements] = useState([])
  const [showCloseButton, setShowCloseButton] = useState(false)
  const [showTestCompletionMessage, setShowTestCompletionMessage] = useState(false)

  useEffect(() => {
    const elements = []
    let hasLoadingTests = false

    tests.forEach((status, test) => {
      const icon = iconsMap.get(status)
      if (status === TestStatus.Loading) {
        hasLoadingTests = true
      }

      elements.push(
        <div key={`${test}-${status}`} className={classes.tests}>
          {status && (
            <FontAwesomeIcon
              solid={status !== TestStatus.Loading}
              className={clsx(icon.classes, classes[getIconClass(status)])}
            >
              {icon.icon}
            </FontAwesomeIcon>
          )}
          <Text>{test}</Text>
          {status === TestStatus.Loading && (
            <Text className={classes.checkingText}>Checking...</Text>
          )}
        </div>,
      )
    })
    setTestElements(elements)
    setShowCloseButton(!hasLoadingTests)
    setShowTestCompletionMessage(!hasLoadingTests)
  }, [tests])

  return (
    <Dialog open={showDialog} fullWidth maxWidth="sm">
      <FormFieldCard title={title} link={link}>
        <div className={classes.dialogContent}>
          <Text className={classes.subHeader}>
            {showTestCompletionMessage ? testsCompletionMessage : subtitle}
          </Text>
          {testElements}
        </div>
        {errorMessage && (
          <div className={classes.error}>
            <header>
              <FontAwesomeIcon>{iconsMap.get('error').icon}</FontAwesomeIcon>
              <Text variant="caption1">{errorMessage}</Text>
            </header>
          </div>
        )}
        <DialogActions className={classes.dialogActions}>
          {showCloseButton && <SubmitButton onClick={onClose}>Close</SubmitButton>}
        </DialogActions>
      </FormFieldCard>
    </Dialog>
  )
}

export default TestsDialog

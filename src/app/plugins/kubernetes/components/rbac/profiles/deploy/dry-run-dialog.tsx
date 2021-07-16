import React, { useCallback, useState } from 'react'
import { Dialog, DialogActions, makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'
import Text from 'core/elements/text'
import { getProfileBinding, getProfileBindingDetails } from '../actions'
import useInterval from 'core/hooks/useInterval'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles<Theme>((theme) => ({
  outlinedButton: {
    background: theme.palette.grey['000'],
    color: theme.palette.blue[500],
  },
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  dialogContent: {
    margin: theme.spacing(3, 2),
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
}))

interface Props {
  handleClose: any
  onFinish: any
  className?: string
  bindingName: string
  setWizardContext: any
}

const DryRunDialog = ({
  className = '',
  bindingName,
  handleClose,
  onFinish,
  setWizardContext,
}: Props) => {
  const classes = useStyles({})
  // @ts-ignore not using lastIntervalTs but this is what triggers the poll
  const [lastIntervalTs, setLastIntervalTs] = useState(new Date().valueOf())
  const [lastFetchTs, setLastFetchTs] = useState(new Date().valueOf())

  const getUpdate = useCallback(async () => {
    const ts = new Date().valueOf()
    setLastFetchTs(ts)
    setLastIntervalTs(ts)
    const profile = await getProfileBinding(bindingName)
    if (['success', 'deleting'].includes(profile.status.phase)) {
      const details = await getProfileBindingDetails(bindingName)
      const analysis = details.analysis
      setWizardContext({ analysis })
      onFinish()
    }
  }, [setLastFetchTs, setLastIntervalTs, onFinish, setWizardContext])

  useInterval(() => {
    setLastIntervalTs(new Date().valueOf())
  }, 5000)
  const currentTs = new Date().valueOf()
  if (currentTs - lastFetchTs > 30000) {
    getUpdate()
  }

  return (
    <>
      <Dialog open fullWidth maxWidth="sm" onClose={handleClose}>
        <div className={classes.dialogContainer}>
          <Text variant="body1" className={classes.dialogHeader}>
            Drift Analysis
          </Text>
          <div className={classes.dialogContent}>
            <Text variant="body2">
              <FontAwesomeIcon className={classes.marginRight} spin>
                sync
              </FontAwesomeIcon>
              Running drift analysis for cluster and profile... Do not close this dialog until the
              analysis is finished. This may take a few minutes to finish.
            </Text>
          </div>
          <DialogActions>
            <Button color="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
  )
}

export default DryRunDialog

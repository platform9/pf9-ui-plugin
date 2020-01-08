import React, { useCallback, useState } from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import {
  ExpansionPanel as MDExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from '@material-ui/core'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import CancelButton from '../buttons/CancelButton'
import NextButton from '../buttons/NextButton'
import ExternalLink from '../ExternalLink'
import { gettingStartedLink } from 'app/constants'
import CloseButton from '../buttons/CloseButton'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      marginBottom: '4px',
      boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.2)',
      '&:before': {
        background: 'none',
      },
      '&.Mui-expanded': {
        margin: '4px 0px',
      },
    },
    numberedStep: {
      height: '24px',
      width: '24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#e6e6e6',
      borderRadius: '50%',
      fontSize: '12px',
      margin: '0px 10px',
    },
    completedStep: {
      background: '#4adf74 !important',
      color: '#ffffff',
    },
    summaryText: {
      marginLeft: '10px',
      display: 'flex',
      flex: 1,
      fontWeight: '500',
      alignItems: 'center',
    },
    panelDetails: {
      background: '#f6fafe',
      border: '1px solid rgba(74, 163, 223, 0.5)',
      borderLeft: '0px',
      borderRight: '0px',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    actionRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: theme.spacing(),
    },
  }),
)

const ExpansionPanel = ({
  expanded,
  onClick,
  children,
  completed,
  stepNumber,
  summary,
  onSkip = undefined,
  skipConfirmTitle = undefined,
}) => {
  const classes = useStyles()

  const [overlay, setOverlay] = useState(false)

  const handleConfirm = useCallback(
    (e) => {
      onSkip()
      handleToggleOverlay(e)
    },
    [overlay],
  )

  const handleToggleOverlay = useCallback(
    (e) => {
      setOverlay(!overlay)
      e && e.stopPropagation()
    },
    [overlay],
  )

  return (
    <MDExpansionPanel
      className={classes.root}
      expanded={expanded}
      onClick={overlay ? undefined : onClick}
    >
      <ExpansionPanelSummary>
        {expanded ? <ExpandMore /> : <ChevronRight />}
        <div className={classes.summaryText}>
          {completed ? (
            <div className={`${classes.numberedStep} ${classes.completedStep}`}>
              <FontAwesomeIcon>check</FontAwesomeIcon>
            </div>
          ) : (
            <div className={classes.numberedStep}>{stepNumber}</div>
          )}
          <span>{summary}</span>
        </div>
        {!!onSkip && !completed && <CloseButton onClick={handleToggleOverlay} />}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        {children}
        <Dialog open={overlay}>
          <DialogTitle>{skipConfirmTitle}</DialogTitle>
          <DialogContent>
            <Typography>
              If you are all set, you can remove this step from your getting started wizard. You can
              always visit the “getting started” section in our support documentation{' '}
              <ExternalLink url={gettingStartedLink}>here</ExternalLink> if you need help in the future.
            </Typography>
            <div className={classes.actionRow}>
              <CancelButton onClick={handleToggleOverlay} />
              <NextButton showForward={false} onClick={handleConfirm}>
                Confirm
              </NextButton>
            </div>
          </DialogContent>
        </Dialog>
      </ExpansionPanelDetails>
    </MDExpansionPanel>
  )
}

export default ExpansionPanel

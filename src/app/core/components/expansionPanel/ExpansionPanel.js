import React, { useCallback, useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/styles'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  ExpansionPanel as MDExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
} from '@material-ui/core'
import { ChevronRight, ExpandMore } from '@material-ui/icons'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import CancelButton from '../buttons/CancelButton'
import NextButton from '../buttons/NextButton'
import ExternalLink from '../ExternalLink'
import { gettingStartedLink } from 'k8s/links'
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

  const [showOverlay, setShowOverlay] = useState(false)

  const handleConfirm = useCallback(
    (e) => {
      onSkip()
      handleToggleOverlay(e)
    },
    [showOverlay],
  )

  const handleToggleOverlay = useCallback(
    (e) => {
      setShowOverlay(!showOverlay)
      e && e.stopPropagation()
    },
    [showOverlay],
  )

  return (
    <MDExpansionPanel
      className={classes.root}
      expanded={expanded}
    >
      <ExpansionPanelSummary
        onClick={showOverlay ? undefined : onClick}
      >
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
        {!!onSkip && !completed && (
          <CloseButton tooltip="Skip Step" onClick={handleToggleOverlay} />
        )}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        {children}
        <Dialog open={showOverlay}>
          <DialogTitle>{skipConfirmTitle}</DialogTitle>
          <DialogContent>
            <Typography>
              If you are all set, you can remove this step from your getting started wizard. You can
              always visit the “getting started” section in our support documentation{' '}
              <ExternalLink url={gettingStartedLink}>here</ExternalLink> if you need help in the
              future.
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

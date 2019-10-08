import React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import { ExpansionPanel as MDExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles(theme => createStyles({
  root: {
    marginBottom: '4px',
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.2)',
    '&:before': {
      background: 'none'
    },
    '&.Mui-expanded': {
      margin: '4px 0px'
    }
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
    margin: '0px 10px'
  },
  completedStep: {
    background: '#4adf74 !important',
    color: '#ffffff'
  },
  summaryText: {
    marginLeft: '10px',
    display: 'flex',
    fontWeight: '500',
    alignItems: 'center'
  },
  panelDetails: {
    background: '#f6fafe',
    border: '1px solid rgba(74, 163, 223, 0.5)',
    borderLeft: '0px',
    borderRight: '0px',
    padding: '40px'
  }
}))

const ExpansionPanel = ({ expanded, onClick, children, completed, stepNumber, summary }) => {
  const classes = useStyles()

  return (
    <MDExpansionPanel className={classes.root} expanded={expanded} onClick={onClick}>
      <ExpansionPanelSummary>
        { expanded
          ? <ExpandMore />
          : <ChevronRight />
        }
        <div className={classes.summaryText}>
          { completed
            ? <div className={`${classes.numberedStep} ${classes.completedStep}`}>
              <FontAwesomeIcon>check</FontAwesomeIcon>
            </div>
            : <div className={classes.numberedStep}>{stepNumber}</div>
          }
          <span>{summary}</span>
        </div>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        {children}
      </ExpansionPanelDetails>
    </MDExpansionPanel>
  )
}

ExpansionPanel.propTypes = {
  expanded: PropTypes.bool,
  onClick: PropTypes.func,
  summary: PropTypes.string,
  stepNumber: PropTypes.number
}

export default ExpansionPanel

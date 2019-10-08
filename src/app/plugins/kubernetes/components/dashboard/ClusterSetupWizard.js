import React, { useCallback, useState } from 'react'
import { except } from 'app/utils/fp'
import { Typography } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/styles'
import ExpansionPanel from 'core/components/expansionPanel/ExpansionPanel'
import { Link } from 'react-router-dom'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import RightAlign from 'core/components/RightAlign'

const useStyles = makeStyles(theme => createStyles({
  root: {
    padding: '20px 40px 80px',
    background: '#f3f3f4',
    color: '#606060'
  },
  title: {
    fontSize: '18px',
    margin: '20px 0px',
    fontWeight: '300'
  },
  description: {
    background: '#ffffff',
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    padding: '30px 40px',
    fontSize: '13px',
    margin: '16px 0px'
  },
  descriptionHeader: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '12px'
  },
  button: {
    display: 'flex',
    fontSize: '13px',
    marginLeft: '30px',
    '&:first-child': {
      marginLeft: '0px'
    }
  },
  icon: {
    fontSize: '14px',
    marginRight: '6px'
  },
  link: {
    textDecoration: 'none',
    color: '#606060'
  }
}))

const ClusterSetupWizard = () => {
  // Initial state will be handled by a loader later on
  // Initialize the state with the first panel expanded
  const [activePanels, setActivePanels] = useState([1])
  const classes = useStyles()

  const togglePanel = useCallback(panelIdx => () => {
    setActivePanels(
      activePanels.includes(panelIdx)
        ? except(panelIdx, activePanels) // Remove the panel idx if expanded
        : [panelIdx, ...activePanels] // Add the panel idx if not expanded
    )
  }, [activePanels])

  const ButtonLink = ({ url, icon, label }) => {
    return (
      <div className={classes.button}>
        <Link className={classes.link} to={url}>
          <FontAwesomeIcon className={classes.icon}>{icon}</FontAwesomeIcon>
          <span>{label}</span>
        </Link>
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <RightAlign>
        <ButtonLink
          url='/ui/kubernetes/dashboard'
          icon='user-plus'
          label='Invite Team Member'
        />
        <ButtonLink
          url='/ui/kubernetes/dashboard'
          icon='file-alt'
          label='Setup Documentation'
        />
      </RightAlign>
      <Typography className={classes.title}>Set up your first Kubernetes cluster</Typography>
      <div className={classes.description}>
        <Typography className={classes.descriptionHeader}>Create your first Kubernetes Cluster</Typography>
        <Typography>Create your first Kubernetes cluster so you can start running some appications on it.</Typography>
      </div>
      <ExpansionPanel
        expanded={activePanels.includes(1)}
        onClick={togglePanel(1)}
        stepNumber={1}
        summary="Choose a destination for your cluster"
      >
        <div>Stuff goes here blah blah blah</div>
      </ExpansionPanel>
      <ExpansionPanel
        expanded={activePanels.includes(2)}
        onClick={togglePanel(2)}
        stepNumber={2}
        summary="Choose a destination for your cluster"
        completed
      >
        <div>Stuff goes here</div>
      </ExpansionPanel>
      <ExpansionPanel
        expanded={activePanels.includes(3)}
        onClick={togglePanel(3)}
        stepNumber={3}
        summary="Choose a destination for your cluster"
      >
        <div>Stuff goes here</div>
      </ExpansionPanel>
    </div>
  )
}

export default ClusterSetupWizard

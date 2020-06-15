import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography } from '@material-ui/core'
import BulletList from 'core/components/BulletList'
import Alert from 'core/components/Alert'
import SubmitButton from 'core/components/buttons/SubmitButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ExternalLink from 'core/components/ExternalLink'
import { gettingStartedHelpLink } from 'k8s/links'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: 4,
    boxShadow:
      '0 2.5px 2.5px -1.5px rgba(0, 0, 0, 0.2), ' +
      '0 1.5px 7px 1px rgba(0, 0, 0, 0.12), ' +
      '0 4px 5px 0.5px rgba(0, 0, 0, 0.14)',
    padding: theme.spacing(3, 2),
    marginTop: theme.spacing(4),
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  requirements: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    margin: theme.spacing(4),
  },
  alertTitle: {
    marginLeft: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  bulletList: {
    marginLeft: theme.spacing(2),
  },
  requirementsTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.text.primary}`,
    padding: theme.spacing(1, 1, 1.5, 1),
    marginBottom: theme.spacing(1),
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
  harwareSpecIcon: {
    padding: theme.spacing(1, 0.5, 0.75, 0.5),
    borderRadius: 4,
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.paper,
    marginRight: theme.spacing(2),
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
}))

const nodeServices = ['Prometheus', 'Grafana']

const BareOSClusterRequirements = ({ onComplete }) => {
  const classes = useStyles({})
  const handleClick = useCallback(() => {
    onComplete(routes.cluster.addBareOs.path())
  }, [onComplete])
  return (
    <FormFieldCard
      title="BareOS Cluster"
      link={
        <div>
          <FontAwesomeIcon className={classes.blueIcon} size="md">
            file-alt
          </FontAwesomeIcon>
          <ExternalLink url={gettingStartedHelpLink}>BareOS Setup Documentation</ExternalLink>
        </div>
      }
    >
      <Typography className={classes.text}>
        Create a BareOS cluster using Ubuntu or CentOS physical or virtual machines
      </Typography>
      <Typography className={classes.text}>Cluster comes built in with:</Typography>
      <BulletList className={classes.bulletList} items={nodeServices} />

      <Alert variant="info">
        <Typography className={classes.alertTitle} variant="subtitle2">
          Minimum Hardware Requirements:
        </Typography>
        <div className={classes.requirements}>
          <HardwareSpec title="2 VCPUs" icon="microchip" />
          <HardwareSpec title="5GB RAM" icon="memory" />
          <HardwareSpec title="20GB HDD" icon="hdd" />
        </div>
      </Alert>
      <div>
        <SubmitButton onClick={handleClick}>Deploy With Bare OS</SubmitButton>
      </div>
    </FormFieldCard>
  )
}
export default BareOSClusterRequirements

const HardwareSpec = ({ title, icon }) => {
  const classes = useStyles({})
  return (
    <div className={classes.flex}>
      <span className={classes.harwareSpecIcon}>
        <FontAwesomeIcon className={classes.blueIcon}>{icon}</FontAwesomeIcon>
      </span>
      <Typography>{title}</Typography>
    </div>
  )
}

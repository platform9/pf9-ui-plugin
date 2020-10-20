import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/styles'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ExternalLink from 'core/components/ExternalLink'
import { gettingStartedHelpLink } from 'k8s/links'
import { routes } from 'core/utils/routes'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import BulletList from 'core/components/BulletList'
import Text from 'core/elements/text'
import Info from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import { ClusterCreateTypes } from '../model'

const useStyles = makeStyles<Theme>((theme) => ({
  alertTitle: {
    display: 'flex',
    alignItems: 'center',

    '& i': {
      color: theme.palette.blue[500],
      fontSize: 22,
      marginRight: 4,
    },
  },
  text: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
  },
  bulletList: {
    margin: theme.spacing(4, 4, 1, 4),
    flex: 1,
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  infoContainer: {
    margin: '60px 0 40px 0',
  },
  formCard: {
    color: theme.palette.grey[700],
  },
}))

const azureReqs = [
  'Azure VM Instance managment',
  'Azure Traffic Manager managment',
  'Azure Application Gateway mangement',
  'Azure Managed Disks management',
]

const AzureClusterRequirements = ({ onComplete, provider }) => {
  const classes = useStyles({})
  const handleClick = useCallback(
    (type: ClusterCreateTypes) => () => {
      onComplete(routes.cluster.addAzure[type].path())
    },
    [onComplete],
  )
  return (
    <FormFieldCard
      className={classes.formCard}
      title="Microsoft Azure Deployment"
      link={
        <ExternalLink textVariant="caption2" url={gettingStartedHelpLink}>
          Azure Cluster Help
        </ExternalLink>
      }
    >
      <Text variant="body2" className={classes.text}>
        Build a Kubernetes Cluster using Azure VMs Instances
      </Text>
      <Info className={classes.infoContainer}>
        <Text className={classes.alertTitle} variant="body2">
          <FontAwesomeIcon>info-circle</FontAwesomeIcon> The following permissions are required to
          deploy fully automated Managed Kubernetes clusters:
        </Text>
        <BulletList className={classes.bulletList} items={azureReqs} />
      </Info>
      <div className={classes.actionRow}>
        <Text variant="caption1">For simple & quick cluster creation with default settings:</Text>
        <SubmitButton onClick={handleClick(ClusterCreateTypes.OneClick)}>
          One-Click Cluster
        </SubmitButton>
      </div>
      <div className={classes.actionRow}>
        <Text variant="caption1">For more customized cluster creation:</Text>
        <SubmitButton onClick={handleClick(ClusterCreateTypes.Custom)}>
          Advanced Cluster Setup
        </SubmitButton>
      </div>
    </FormFieldCard>
  )
}
export default AzureClusterRequirements

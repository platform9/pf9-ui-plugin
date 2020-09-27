import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import Alert from 'core/components/Alert'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ExternalLink from 'core/components/ExternalLink'
import { gettingStartedHelpLink } from 'k8s/links'
import { routes } from 'core/utils/routes'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import BulletList from 'core/components/BulletList'
import Text from 'core/elements/text'

const useStyles = makeStyles((theme: Theme) => ({
  alertTitle: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
  bulletList: {
    margin: theme.spacing(4),
    flex: 1,
  },
}))

const azureReqs = [
  'Azure VM Instance managment',
  'Azure Traffic Manager managment',
  'Azure Application Gateway mangement',
  'Azure Managed Disks management',
]

const AzureClusterRequirements = ({ onComplete }) => {
  const classes = useStyles({})
  const handleClick = useCallback(() => {
    onComplete(routes.cluster.addAzure.path())
  }, [onComplete])
  return (
    <FormFieldCard
      title="Microsoft Azure Deployment"
      link={
        <div>
          <FontAwesomeIcon className={classes.blueIcon} size="md">
            file-alt
          </FontAwesomeIcon>
          <ExternalLink url={gettingStartedHelpLink}>Azure Setup Documentation</ExternalLink>
        </div>
      }
    >
      <Text className={classes.text}>Build a Kubernetes Cluster using Azure VMs Instances</Text>

      <Alert variant="info">
        <Text className={classes.alertTitle} variant="subtitle2">
          The following permissions are required on your Azure account in order to deploy fully
          automated Managed Kubernetes clusters:
        </Text>
        <BulletList className={classes.bulletList} items={azureReqs} />
      </Alert>
      <div>
        <SubmitButton onClick={handleClick}>Deploy With Azure</SubmitButton>
      </div>
    </FormFieldCard>
  )
}
export default AzureClusterRequirements

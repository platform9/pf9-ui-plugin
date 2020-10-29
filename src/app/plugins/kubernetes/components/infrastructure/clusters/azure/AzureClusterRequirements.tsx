import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ExternalLink from 'core/components/ExternalLink'
import { gettingStartedHelpLink } from 'k8s/links'
import { routes } from 'core/utils/routes'
import BulletList from 'core/components/BulletList'
import Text from 'core/elements/text'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import { ClusterCreateTypes } from '../model'
import AzureCloudProviderRequirementDialog from './AzureCloudProviderRequirementDialog'
import useDataLoader from 'core/hooks/useDataLoader'
import { CloudProviders } from '../../cloudProviders/model'
import { cloudProviderActions } from '../../cloudProviders/actions'

const useStyles = makeStyles<Theme>((theme) => ({
  text: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
  },
  bulletList: {
    margin: theme.spacing(2, 4, 1, 4),
    flex: 1,
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
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
  const [showDialog, setShowDialog] = useState(false)
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const handleClick = useCallback(
    (type: ClusterCreateTypes) => () => {
      const hasAzureProvider = !!cloudProviders.some(
        (provider) => provider.type === CloudProviders.Azure,
      )
      if (!hasAzureProvider) {
        setShowDialog(true)
      } else {
        onComplete(routes.cluster.addAzure[type].path())
      }
    },
    [onComplete, cloudProviders],
  )
  return (
    <>
      {showDialog && (
        <AzureCloudProviderRequirementDialog
          showDialog={showDialog}
          setShowDialog={setShowDialog}
        />
      )}
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
        <IconInfo
          icon="info-circle"
          title="The following permissions are required to deploy fully automated Managed Kubernetes clusters:"
        >
          <BulletList className={classes.bulletList} items={azureReqs} />
        </IconInfo>
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
    </>
  )
}
export default AzureClusterRequirements

import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'
import { gettingStartedHelpLink } from 'k8s/links'
import ExternalLink from 'core/components/ExternalLink'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import { ClusterCreateTypes } from '../model'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from '../../cloudProviders/actions'
import { CloudProviders } from '../../cloudProviders/model'
import AwsCloudProviderRequirementDialog from './AwsCloudProviderRequirementDialog'

const useStyles = makeStyles<Theme>((theme) => ({
  requirements: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    margin: theme.spacing(2, 4, 1, 4),
  },
  text: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
  },
  bulletList: {
    marginLeft: theme.spacing(2),
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
const AwsReqsLeftSection = [
  'ELB Management',
  'Route 53 DNS Configuration',
  'Access to 2 or more Availability Zones within the region',
]
const AwsReqsRightSection = ['EC2 Instance Management', 'EBS Volume Management', 'VPC Management']

const AwsClusterRequirements = ({ onComplete, provider }) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(false)
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const handleClick = useCallback(
    (type: ClusterCreateTypes) => () => {
      const hasAwsProvider = !!cloudProviders.some(
        (provider) => provider.type === CloudProviders.Aws,
      )
      if (!hasAwsProvider) {
        setShowDialog(true)
      } else {
        onComplete(routes.cluster.addAws[type].path())
      }
    },
    [onComplete, cloudProviders],
  )
  return (
    <>
      {showDialog && (
        <AwsCloudProviderRequirementDialog showDialog={showDialog} setShowDialog={setShowDialog} />
      )}
      <FormFieldCard
        className={classes.formCard}
        title="Amazon AWS Deployment"
        link={
          <ExternalLink textVariant="caption2" url={gettingStartedHelpLink}>
            AWS Cluster Help
          </ExternalLink>
        }
      >
        <Text variant="body2" className={classes.text}>
          Build a Kubernetes Cluster using AWS EC2 Instances
        </Text>

        <IconInfo
          icon="info-circle"
          title="The following permissions are required to deploy fully automated Managed Kubernetes clusters:"
        >
          <div className={classes.requirements}>
            <BulletList className={classes.bulletList} items={AwsReqsLeftSection} />
            <BulletList className={classes.bulletList} items={AwsReqsRightSection} />
          </div>
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
export default AwsClusterRequirements

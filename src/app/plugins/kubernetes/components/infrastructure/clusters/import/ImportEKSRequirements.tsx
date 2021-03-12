import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { eksHelpLink } from 'k8s/links'
import ExternalLink from 'core/components/ExternalLink'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from '../../cloudProviders/actions'
import { CloudProviders } from '../../cloudProviders/model'
import AwsCloudProviderRequirementDialog from '../../clusters/aws/AwsCloudProviderRequirementDialog'
import { routes } from 'core/utils/routes'

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
  'The EKS Cluster must be using Public or Public + Private VPCs',
  'EKS Cluster using Private VPCs can be added in Read-Only mode',
  'The IAM User who owns the Cloud Provider credentials must have access to the EKS Cluster',
]

const ImportEKSRequirements = ({ onComplete, platform }) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(false)
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const handleClick = useCallback(() => {
    const hasAwsProvider = !!cloudProviders.some((provider) => provider.type === CloudProviders.Aws)
    if (!hasAwsProvider) {
      setShowDialog(true)
    } else {
      onComplete(routes.cluster.import.eks.path())
    }
  }, [onComplete, cloudProviders])

  return (
    <>
      {showDialog && (
        <AwsCloudProviderRequirementDialog showDialog={showDialog} setShowDialog={setShowDialog} />
      )}
      <FormFieldCard
        className={classes.formCard}
        title="AWS EKS Cluster Management"
        link={
          <ExternalLink textVariant="caption2" url={eksHelpLink}>
            EKS Help
          </ExternalLink>
        }
      >
        <Text variant="body2" className={classes.text}>
          Platform9 is able to connect to AWS and import EKS clusters to bring them under
          management.
        </Text>
        <IconInfo
          icon="info-circle"
          title="The following requirements must be met to be able to import and manage EKS Clusters:"
        >
          <div className={classes.requirements}>
            <BulletList className={classes.bulletList} items={AwsReqsLeftSection} />
          </div>
        </IconInfo>
        <div className={classes.actionRow}>
          <SubmitButton onClick={handleClick}>Import EKS Clusters</SubmitButton>
        </div>
      </FormFieldCard>
    </>
  )
}
export default ImportEKSRequirements

import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
// import { aksHelpLink } from 'k8s/links'
// import ExternalLink from 'core/components/ExternalLink'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from '../../cloudProviders/actions'
import { CloudProviders } from '../../cloudProviders/model'
import { routes } from 'core/utils/routes'
import AzureCloudProviderRequirementDialog from '../azure/AzureCloudProviderRequirementDialog'

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
const AzureReqsLeftSection = [
  'The API Server for the AKS Cluster must accessable on a Public IP or Public Load balancer',
  'AKS Cluster with no Public API Server access will be in read only mode',
]

const ImportAKSRequirements = ({ onComplete, platform }) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(false)
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const handleClick = useCallback(() => {
    const hasAzureProvider = !!cloudProviders.some(
      (provider) => provider.type === CloudProviders.Azure,
    )
    if (!hasAzureProvider) {
      setShowDialog(true)
    } else {
      onComplete(routes.cluster.import.eks.path())
    }
  }, [onComplete, cloudProviders])

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
        title="Microsoft AKS Cluster Management"
        // link={
        //   <ExternalLink textVariant="caption2" url={aksHelpLink}>
        //     AKS Help
        //   </ExternalLink>
        // }
      >
        <Text variant="body2" className={classes.text}>
          Platform9 is able to connect to Azure and import AKS clusters to bring them under
          management.
        </Text>
        <Text variant="body2">This feature is coming soon.</Text>
        <IconInfo
          icon="info-circle"
          title="The following requirements must be met to be able to import and manage AKS Clusters:"
        >
          <div className={classes.requirements}>
            <BulletList className={classes.bulletList} items={AzureReqsLeftSection} />
          </div>
        </IconInfo>
        <div className={classes.actionRow}>
          <SubmitButton onClick={handleClick} disabled>
            Import AKS Clusters
          </SubmitButton>
        </div>
      </FormFieldCard>
    </>
  )
}
export default ImportAKSRequirements

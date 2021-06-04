import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import AzureCloudProviderRequirementDialog from '../azure/AzureCloudProviderRequirementDialog'
import { CloudProviders } from '../../cloudProviders/model'
import { routes } from 'core/utils/routes'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from '../../cloudProviders/actions'
import BulletList from 'core/components/BulletList'

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

const AzureReqs = [
  'The AKS Cluster must be accessible via a Public IP',
  'AKS Cluster using Private Virtual Networks can be added in Read-Only mode',
  'The service principal that was used to create the Cloud Provider must have access to the AKS Cluster as an Azure Kubernetes Service Cluster Admin Role',
]

const ImportAKSRequirements = ({ onComplete, platform }) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(false)
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const handleClick = useCallback(() => {
    const hasAzureProvider = !!cloudProviders.find(
      (provider) => provider.type === CloudProviders.Azure,
    )
    if (!hasAzureProvider) {
      setShowDialog(true)
    } else {
      onComplete(routes.cluster.import.aks.path())
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
          Platform9 is able to connect to Azure and import existing AKS clusters to bring them under
          management. Once connected to Platform9 you will be able to deploy Platform9 Monitoring,
          leverage the Application Catalog to deploy apps and configure RBAC, Pods, Deployments and
          Services.
        </Text>
        <IconInfo
          icon="info-circle"
          title="The following requirements must be met to be able to import and manage AKS Clusters:"
        >
          <div className={classes.requirements}>
            <BulletList className={classes.bulletList} items={AzureReqs} />
          </div>
        </IconInfo>
        <div className={classes.actionRow}>
          <SubmitButton onClick={handleClick}>Import AKS Clusters</SubmitButton>
        </div>
      </FormFieldCard>
    </>
  )
}
export default ImportAKSRequirements

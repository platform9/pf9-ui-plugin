import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import { routes } from 'core/utils/routes'
import BulletList from 'core/components/BulletList'
import { cloudProviderActions } from '../../cloudProviders/actions'
import { CloudProviders } from '../../cloudProviders/model'
import useDataLoader from 'core/hooks/useDataLoader'
import GoogleCloudProviderRequirementDialog from '../google/GoogleCloudProviderRequirementDialog'

const useStyles = makeStyles<Theme>((theme) => ({
  requirements: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    margin: theme.spacing(2, 4, 1, 4),
  },
  indented: {
    margin: theme.spacing(0, 4),
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

const GoogleReqs = [
  'Compute Viewer: roles/compute.viewer',
  'Project Viewer: roles/viewer',
  'Kubernetes Engine Admin: roles/container.admin',
  'Service Account User: roles/iam.serviceAccountUser',
]

const ImportGKERequirements = ({ onComplete, platform }) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(false)
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const handleClick = useCallback(() => {
    const hasGoogleProvider = !!cloudProviders.some(
      (provider) => provider.type === CloudProviders.Gcp,
    )
    if (!hasGoogleProvider) {
      setShowDialog(true)
    } else {
      onComplete(routes.cluster.import.gke.path())
    }
  }, [onComplete, cloudProviders])

  return (
    <>
      {showDialog && (
        <GoogleCloudProviderRequirementDialog
          showDialog={showDialog}
          setShowDialog={setShowDialog}
        />
      )}
      <FormFieldCard
        className={classes.formCard}
        title="Google GKE Cluster Management"
        // link={
        //   <ExternalLink textVariant="caption2" url={gkeHelpLink}>
        //     GKE Help
        //   </ExternalLink>
        // }
      >
        <Text variant="body2" className={classes.text}>
          Platform9 is able to connect to Google and import existing GKE clusters to bring them
          under management. Once connected to Platform9 you will be able to deploy Platform9
          Monitoring, leverage the Application Catalog to deploy apps and configure RBAC, Pods,
          Deployments and Services.
        </Text>
        <IconInfo
          icon="info-circle"
          title="The following requirements must be met to be able to import and manage GKE Clusters:"
        >
          <Text variant="body2" className={classes.indented}>
            A service account within your Google Cloud project with the following roles:
          </Text>
          <div className={classes.requirements}>
            <BulletList className={classes.bulletList} items={GoogleReqs} />
          </div>
        </IconInfo>
        <div className={classes.actionRow}>
          <SubmitButton onClick={handleClick}>Import GKE Clusters</SubmitButton>
        </div>
      </FormFieldCard>
    </>
  )
}
export default ImportGKERequirements

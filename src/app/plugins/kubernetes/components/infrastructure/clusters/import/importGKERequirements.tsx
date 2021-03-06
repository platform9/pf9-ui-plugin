import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
// import { eksHelpLink } from 'k8s/links'
// import ExternalLink from 'core/components/ExternalLink'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from '../../cloudProviders/actions'
import { CloudProviders } from '../../cloudProviders/model'
// import AwsCloudProviderRequirementDialog from '../../clusters/aws/AwsCloudProviderRequirementDialog'
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
const GKEReqsLeftSection = [
  'The cluster must be a public Google Kubernetes Engine (GKE) cluster ',
  'GKE Cluster with no Public API Server access will be in read only mode',
]

const ImportGKERequirements = ({ onComplete, platform }) => {
  const classes = useStyles({})
  // const [showDialog, setShowDialog] = useState(false)
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const handleClick = useCallback(() => {
    const hasGoogleProvider = !!cloudProviders.some(
      (provider) => provider.type === CloudProviders.Google,
    )
    if (!hasGoogleProvider) {
      // setShowDialog(true)
    } else {
      onComplete(routes.cluster.importEKS.path())
    }
  }, [onComplete, cloudProviders])

  return (
    <>
      {/* {showDialog && (
        <AwsCloudProviderRequirementDialog showDialog={showDialog} setShowDialog={setShowDialog} />
      )} */}
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
          Platform9 is able to connect to Google and import GKE clusters to bring them under
          management.
        </Text>
        <Text variant="body2">This feature is coming soon.</Text>
        <IconInfo
          icon="info-circle"
          title="The following requirements must be met to be able to import and manage GKE Clusters:"
        >
          <div className={classes.requirements}>
            <BulletList className={classes.bulletList} items={GKEReqsLeftSection} />
          </div>
        </IconInfo>
        <div className={classes.actionRow}>
          <SubmitButton onClick={handleClick} disabled>
            Import GKE Clusters
          </SubmitButton>
        </div>
      </FormFieldCard>
    </>
  )
}
export default ImportGKERequirements

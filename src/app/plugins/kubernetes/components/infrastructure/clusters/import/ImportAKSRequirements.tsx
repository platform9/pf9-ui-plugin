import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import AzureCloudProviderRequirementDialog from '../azure/AzureCloudProviderRequirementDialog'
import ComingSoonDialog from './ComingSoonDialog'
import { trackEvent } from 'utils/tracking'
import ExternalLink from 'core/components/ExternalLink'
import Bugsnag from '@bugsnag/js'

const useStyles = makeStyles<Theme>((theme) => ({
  requirements: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    margin: theme.spacing(2, 4, 1, 4),
  },
  infoComingSoon: {
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

const ImportAKSRequirements = ({ onComplete, platform }) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(false)
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false)
  // const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const triggerDialog = () => {
    Bugsnag.leaveBreadcrumb('Clicked Import AKS Cluster')
    trackEvent('Clicked Import AKS Cluster')
    setShowComingSoonDialog(true)
  }

  // const handleClick = useCallback(() => {
  //   const hasAzureProvider = !!cloudProviders.some(
  //     (provider) => provider.type === CloudProviders.Azure,
  //   )
  //   if (!hasAzureProvider) {
  //     setShowDialog(true)
  //   } else {
  //     onComplete(routes.cluster.import.eks.path())
  //   }
  // }, [onComplete, cloudProviders])

  return (
    <>
      {showDialog && (
        <AzureCloudProviderRequirementDialog
          showDialog={showDialog}
          setShowDialog={setShowDialog}
        />
      )}
      {showComingSoonDialog && (
        <ComingSoonDialog onClose={() => setShowComingSoonDialog(false)} clusterType="AKS" />
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
          Coming Soon: Platform9 is building the ability to connect to Azure and import AKS clusters
          to bring them under management.
        </Text>
        <IconInfo icon="info-circle" spacer={false} title="Coming Soon">
          <div className={classes.infoComingSoon}>
            Visit{' '}
            <ExternalLink url="https://ideas.platform9.com/">ideas.platform9.com</ExternalLink> to
            vote for Azure AKS, engage with our product team and explore all of the new features
            planned for Platform9.
          </div>
        </IconInfo>
        <div className={classes.actionRow}>
          <SubmitButton onClick={triggerDialog}>Import AKS Clusters</SubmitButton>
        </div>
      </FormFieldCard>
    </>
  )
}
export default ImportAKSRequirements

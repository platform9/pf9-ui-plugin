import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
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

const ImportGKERequirements = ({ onComplete, platform }) => {
  const classes = useStyles({})
  // const [showDialog, setShowDialog] = useState(false)
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false)
  // const [cloudProviders] = useDataLoader(cloudProviderActions.list)

  const triggerDialog = () => {
    Bugsnag.leaveBreadcrumb('Clicked Import GKE Cluster')
    trackEvent('Clicked Import GKE Cluster')
    setShowComingSoonDialog(true)
  }

  // const handleClick = useCallback(() => {
  //   const hasGoogleProvider = !!cloudProviders.some(
  //     (provider) => provider.type === CloudProviders.Google,
  //   )
  //   if (!hasGoogleProvider) {
  //     // setShowDialog(true)
  //   } else {
  //     onComplete(routes.cluster.import.eks.path())
  //   }
  // }, [onComplete, cloudProviders])

  return (
    <>
      {/* {showDialog && (
        <AwsCloudProviderRequirementDialog showDialog={showDialog} setShowDialog={setShowDialog} />
      )} */}
      {showComingSoonDialog && (
        <ComingSoonDialog onClose={() => setShowComingSoonDialog(false)} clusterType="GKE" />
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
          Coming Soon: Platform9 is building the ability to connect to Google and import GKE
          clusters to bring them under management
        </Text>
        <IconInfo icon="info-circle" spacer={false} title="Coming Soon">
          <div className={classes.infoComingSoon}>
            Visit{' '}
            <ExternalLink url="https://ideas.platform9.com/">ideas.platform9.com</ExternalLink> to
            vote for Google GKE, engage with our product team and explore all of the new features
            planned for Platform9.
          </div>
        </IconInfo>
        <div className={classes.actionRow}>
          <SubmitButton onClick={triggerDialog}>Import GKE Clusters</SubmitButton>
        </div>
      </FormFieldCard>
    </>
  )
}
export default ImportGKERequirements

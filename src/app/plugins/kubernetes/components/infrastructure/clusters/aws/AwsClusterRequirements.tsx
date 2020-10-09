import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'
import { gettingStartedHelpLink } from 'k8s/links'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ExternalLink from 'core/components/ExternalLink'
import Info from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  requirements: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    margin: theme.spacing(4, 4, 1, 4),
  },
  alertTitle: {
    display: 'flex',
    alignItems: 'center',

    '& i': {
      color: theme.palette.blue[500],
      fontSize: 22,
      marginRight: 4,
    },
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
  infoContainer: {
    margin: '60px 0 40px 0',
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
  const handleClick = useCallback(() => {
    onComplete(routes.cluster.addAws.path())
  }, [onComplete])
  return (
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

      <Info className={classes.infoContainer}>
        <Text className={classes.alertTitle} variant="body2">
          <FontAwesomeIcon>info-circle</FontAwesomeIcon> The following permissions are required to
          deploy fully automated Managed Kubernetes clusters:
        </Text>
        <div className={classes.requirements}>
          <BulletList className={classes.bulletList} items={AwsReqsLeftSection} />
          <BulletList className={classes.bulletList} items={AwsReqsRightSection} />
        </div>
      </Info>

      <div className={classes.actionRow}>
        <Text variant="caption1">For simple & quick cluster creation with default settings:</Text>
        <SubmitButton onClick={handleClick}>One-Click Cluster</SubmitButton>
      </div>
      <div className={classes.actionRow}>
        <Text variant="caption1">For more customized cluster creation:</Text>
        <SubmitButton onClick={handleClick}>Advanced Cluster Setup</SubmitButton>
      </div>
    </FormFieldCard>
  )
}
export default AwsClusterRequirements

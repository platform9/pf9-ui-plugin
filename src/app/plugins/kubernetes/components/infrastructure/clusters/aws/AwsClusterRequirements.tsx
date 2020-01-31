import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography } from '@material-ui/core'
import BulletList from 'core/components/BulletList'
import Alert from 'core/components/Alert'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles((theme: Theme) => ({
  requirements: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    margin: theme.spacing(4)
  },
  alertTitle: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1)
  },
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1)
  },
  bulletList: {
    marginLeft: theme.spacing(2),
    flex: 1
  }
}))
const AwsReqsLeftSection = ['ELB Management', 'Route 53 DNS Configuration', 'Access to 2 or more Availability Zones within the region']
const AwsReqsRightSection = ['EC2 Instance Management', 'EBS Volume Management', 'VPC Management']

const AwsClusterRequirements = ({ onComplete }) => {
  const classes = useStyles({})
  const handleClick = useCallback(() => {
    onComplete(routes.cluster.addAws.path())
  }, [onComplete])
  return (
    <FormFieldCard title="Amazon AWS Deployment">
      <Typography className={classes.text}>Use your existing AWS credentials to create and manage Kubernetes clusters and associated resources within your AWS public cloud environment.</Typography>
      <Typography className={classes.text}>You can create multiple AWS cloud providers; each AWS cloud provider should be associated with a unique set of AWS credentials.</Typography>

      <Alert variant="info">
        <Typography className={classes.alertTitle} variant="subtitle2">The following permissions are required on your AWS account in order to deploy fully automated Managed Kubernetes clusters:</Typography>
        <div className={classes.requirements}>
          <BulletList className={classes.bulletList} items={AwsReqsLeftSection} />
          <BulletList className={classes.bulletList} items={AwsReqsRightSection} />
        </div>
      </Alert>
      <div>
        <SubmitButton onClick={handleClick}>Deploy With AWS</SubmitButton>
      </div>
    </FormFieldCard>
  )
}
export default AwsClusterRequirements

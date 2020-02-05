import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import Alert from 'core/components/Alert'
import { Typography } from '@material-ui/core'
import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { makeStyles } from '@material-ui/styles'
import { awsAccessHelpLink, iamPolicyLink } from 'k8s/links'

const useStyles = makeStyles((theme) => ({
  formWidth: {
    width: 715,
  },
  tableWidth: {
    maxWidth: 560,
  },
  inputWidth: {
    maxWidth: 350,
    marginBottom: theme.spacing(3),
  },
}))

const initialValues = {
  type: 'aws',
}

const AddAwsCloudProvider = ({ onComplete }) => {
  const classes = useStyles()
  return (
    <ValidatedForm onSubmit={onComplete} initialValues={initialValues}>
      <div className={classes.formWidth}>
        <FormFieldCard title="Create AWS Cloud Provider">
          <Typography variant="body1" component="div">
            <p>
              Create a new cloud provider for your Amazon Web Services (AWS) public cloud. This
              cloud provider will work using your existing AWS credentials to create and manage
              Kubernetes clusters and associated resources within your AWS public cloud environment.
            </p>
            <p>
              You can create multiple AWS cloud providers - each AWS cloud provider should be
              associated with a unique set of AWS credentials.
            </p>
            <Alert variant="info">
              <div>
                <p>
                  The following permissions are required on your AWS account in order to deploy
                  fully automated Managed Kubernetes clusters:
                </p>
                <ul>
                  <li>ELB Management</li>
                  <li>Route 53 DNS Configuration</li>
                  <li>Access to 2 or more Availability Zones within the region</li>
                  <li>EC2 Instance Management</li>
                  <li>EBS Volume Management</li>
                  <li>VPC Management</li>
                </ul>
                <p>
                  <ExternalLink url={iamPolicyLink}>
                    View the exact IAM policy we require
                  </ExternalLink>
                </p>
              </div>
            </Alert>
          </Typography>
          <div className={classes.inputWidth}>
            <p>Specify AWS Credentials:</p>
            <TextField required id="name" label="Name" info="Name of the cloud provider" />
            <TextField
              required
              id="key"
              label="AWS Access Key ID"
              info={
                <span>
                  This is the part of the AWS two part accesskey required for API access.&nbsp;
                  <ExternalLink url={awsAccessHelpLink}>Here</ExternalLink> is info on getting your
                  AWS access and secret key.
                </span>
              }
            />
            <TextField
              required
              id="secret"
              type="password"
              label="Secret Key"
              info="The client secret key"
            />
            <SubmitButton>Add Cloud Provider</SubmitButton>
          </div>
        </FormFieldCard>
      </div>
    </ValidatedForm>
  )
}

export default AddAwsCloudProvider

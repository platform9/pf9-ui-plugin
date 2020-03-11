import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import ExternalLink from 'core/components/ExternalLink'
import { makeStyles } from '@material-ui/styles'
import { awsAccessHelpLink, awsPrerequisitesLink } from 'k8s/links'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles((theme) => ({
  blueIcon: {
    color: theme.palette.primary.main,
  },
}))

const initialValues = {
  type: 'aws',
}

const AddAwsCloudProvider = ({ onComplete }) => {
  const classes = useStyles()
  return (
    <ValidatedForm
      onSubmit={onComplete}
      initialValues={initialValues}
      title="Create AWS Cloud Provider"
      formActions={<SubmitButton>Add Cloud Provider</SubmitButton>}
      link={
        <div>
          <FontAwesomeIcon className={classes.blueIcon} size="md">
            file-alt
          </FontAwesomeIcon>
          <ExternalLink url={awsPrerequisitesLink}>
            Need help setting up an AWS provider?
          </ExternalLink>
        </div>
      }
    >
      <TextField required id="name" label="Name" info="Name of the cloud provider" />
      <TextField
        required
        id="key"
        label="Access Key ID"
        info={
          <span>
            Access Key ID (<ExternalLink url={awsAccessHelpLink}>What is this?</ExternalLink>)
          </span>
        }
      />
      <TextField
        required
        id="secret"
        type="password"
        label="Secret Access Key"
        info={
          <span>
            Secret Access Key (
            <ExternalLink url={awsAccessHelpLink}>What is this?</ExternalLink>)
          </span>
        }
      />
    </ValidatedForm>
  )
}

export default AddAwsCloudProvider

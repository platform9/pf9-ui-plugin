import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { makeStyles } from '@material-ui/styles'
import { awsAccessHelpLink, awsPrerequisitesLink } from 'k8s/links'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

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
  submit: {
    marginLeft: theme.spacing(2),
  },
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
    <ValidatedForm onSubmit={onComplete} initialValues={initialValues}>
      <div className={classes.formWidth}>
        <FormFieldCard
          title="Create AWS Cloud Provider"
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
          <div className={classes.inputWidth}>
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
          </div>
        </FormFieldCard>
        <SubmitButton className={classes.submit}>Add Cloud Provider</SubmitButton>
      </div>
    </ValidatedForm>
  )
}

export default AddAwsCloudProvider

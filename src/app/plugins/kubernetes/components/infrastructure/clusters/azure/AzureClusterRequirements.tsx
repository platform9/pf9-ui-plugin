import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography } from '@material-ui/core'
import Alert from 'core/components/Alert'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ExternalLink from 'core/components/ExternalLink'
import { azureServicePrincipalPortal, azureGetValuesForSigningin, azureCreateANewApplicationSecret } from 'app/constants'

const useStyles = makeStyles((theme: Theme) => ({
  requirements: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    margin: theme.spacing(4),
  },
  alertTitle: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  bulletList: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}))

const AzureClusterRequirements = ({ onComplete }) => {
  const classes = useStyles({})
  const handleClick = useCallback(() => {
    onComplete('Azure')
  }, [onComplete])
  return (
    <FormFieldCard title="Amazon AWS Deployment">
      <Typography className={classes.text}>
        Use your existing Azure credentials to create and manage Kubernetes clusters and associated
        resources within your Azure public cloud environment.
      </Typography>
      <Typography className={classes.text}>
        You can create multiple Azure cloud providers - each Azure cloud provider should be
        associated with a unique set of Azure credentials.
      </Typography>

      <Alert variant="info">
        <Typography className={classes.alertTitle} variant="body1">
          To access resources that are secured by an Azure AD tenant, the entity that requires
          access must be represented by a new or existing security principal. The security principal
          defines the access policy and permissions for the user/application in the Azure AD tenant.
          In order to be able to perform the necessary operations on Managed Kubernetes clusters,
          your credentials must have a ‘contributor’ role assigned, or a similar read/write role
          where the user is able to access subscriptions, and create/update/delete Azure resources.
          <ExternalLink url={azureServicePrincipalPortal}>
            See this article
          </ExternalLink>{' '}
          for detailed steps.
        </Typography>
        <Typography className={classes.alertTitle} variant="body1">
          See the{' '}
          <ExternalLink url={azureGetValuesForSigningin}>
            section under get values
          </ExternalLink>{' '}
          for signing in to find the tenant and client IDs.
        </Typography>
        <Typography className={classes.alertTitle} variant="body1">
          A client secret must be present before creating an Azure cloud provider. To learn more
          about creating a client secret, see{' '}
          <ExternalLink url={azureCreateANewApplicationSecret}>
            create a new application secret
          </ExternalLink>
          .
        </Typography>
      </Alert>
      <div>
        <SubmitButton onClick={handleClick}>Deploy With Azure</SubmitButton>
      </div>
    </FormFieldCard>
  )
}
export default AzureClusterRequirements

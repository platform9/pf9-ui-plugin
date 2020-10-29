import React from 'react'
import { Dialog, DialogActions } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'
import ExternalLink from 'core/components/ExternalLink'
import { azurePrerequisitesLink } from 'k8s/links'
import { routes } from 'core/utils/routes'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { CloudProviders } from '../../cloudProviders/model'
import useReactRouter from 'use-react-router'
import Button from 'core/elements/button'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

const useStyles = makeStyles((theme: Theme) => ({
  formCard: {
    maxWidth: 'inherit',
  },
  icon: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  text: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  dialogButtons: {
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(2),
  },
}))

const AzureCloudProviderRequirementDialog = ({ showDialog, setShowDialog }) => {
  const classes = useStyles()
  const { history } = useReactRouter()

  const handleCloudProviderNavigation = () =>
    history.push(routes.cloudProviders.add.path({ type: CloudProviders.Azure }))

  return (
    <Dialog maxWidth="md" open={showDialog}>
      <FormFieldCard
        className={classes.formCard}
        title={
          <Text variant="body1" component="div">
            <FontAwesomeIcon className={classes.icon}>exclamation-circle</FontAwesomeIcon>
            Azure Cloud Provider Required
          </Text>
        }
        link={
          <ExternalLink url={azurePrerequisitesLink}>
            <Text variant="caption2">Need help setting up an Azure provider?</Text>
          </ExternalLink>
        }
      >
        <Text variant="body1" className={classes.text}>
          Connect your Azure account by creating a Azure Cloud Provider.
        </Text>
        <Text variant="body1" className={classes.text}>
          Please note that a Route 53 domain name registration will also be required which can be
          designated during the creation of the new Azure Cloud Provider.
        </Text>
      </FormFieldCard>
      <DialogActions className={classes.dialogButtons}>
        <Button variant="light" color="secondary" onClick={() => setShowDialog(false)}>
          Cancel
        </Button>
        <SubmitButton onClick={handleCloudProviderNavigation}>Add New Cloud Provider</SubmitButton>
      </DialogActions>
    </Dialog>
  )
}

export default AzureCloudProviderRequirementDialog

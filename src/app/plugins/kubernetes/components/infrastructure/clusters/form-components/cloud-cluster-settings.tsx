import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import AppAndContainerSettings from './app-container-settings'
import ManagedAddOnsCheckboxes from './managed-add-ons'
import { Divider } from '@material-ui/core'
import clsx from 'clsx'
import KubernetesVersion from './kubernetes-version'

const useStyles = makeStyles((theme: Theme) => ({
  clusterSettingsCard: {
    maxWidth: '800px',
    flexGrow: 1,
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

interface Props {
  className: string
  wizardContext: any
  setWizardContext: any
}

const ClusterSettingsCard = ({ className, wizardContext, setWizardContext }: Props) => {
  const classes = useStyles()
  return (
    <FormFieldCard
      title="Cluster Settings"
      className={clsx(classes.clusterSettingsCard, className)}
    >
      <KubernetesVersion wizardContext={wizardContext} setWizardContext={setWizardContext} />
      <Divider className={classes.divider} />
      <AppAndContainerSettings />
      <Divider className={classes.divider} />
      <ManagedAddOnsCheckboxes />
    </FormFieldCard>
  )
}

export default ClusterSettingsCard

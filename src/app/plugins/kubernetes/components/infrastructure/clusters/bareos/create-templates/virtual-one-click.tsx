import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { pmkCliOverviewLink } from 'k8s/links'
import { allPass } from 'ramda'
import React from 'react'
import { makeStyles } from '@material-ui/styles'

import ClusterNameField from '../../form-components/name'
import ClusterHostChooser, { isConnected, isUnassignedNode } from '../ClusterHostChooser'

import { masterNodeLengthValidator } from 'core/utils/fieldValidators'
import Theme from 'core/themes/model'

export const templateTitle = 'One Click'

const OneClickVirtualMachineCluster = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles({})
  return (
    <ValidatedForm
      classes={{ root: classes.validatedFormContainer }}
      fullWidth
      initialValues={wizardContext}
      onSubmit={setWizardContext}
      triggerSubmit={onNext}
      elevated={false}
    >
      {/* <PollingData loading={loading} onReload={reload} hidden /> */}
      {/* Cluster Name */}
      <FormFieldCard
        title={`${templateTitle} Single Node Cluster Setup`}
        link={
          <ExternalLink variant="caption2" url={pmkCliOverviewLink}>
            Not Seeing Any Nodes?
          </ExternalLink>
        }
      >
        <ClusterNameField setWizardContext={setWizardContext} />
      </FormFieldCard>

      <FormFieldCard
        title="Select a node"
        link={
          <ExternalLink variant="caption2" url={pmkCliOverviewLink}>
            Not Seeing Any Nodes?
          </ExternalLink>
        }
      >
        <ClusterHostChooser
          id="masterNodes"
          selection="single"
          filterFn={allPass([isConnected, isUnassignedNode])}
          onChange={(value) => setWizardContext({ masterNodes: value })}
          validations={[masterNodeLengthValidator]}
          required
        />
      </FormFieldCard>
    </ValidatedForm>
  )
}

export default OneClickVirtualMachineCluster

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

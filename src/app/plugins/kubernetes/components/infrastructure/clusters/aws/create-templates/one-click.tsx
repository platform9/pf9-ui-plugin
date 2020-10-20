import React from 'react'
import ExternalLink from 'core/components/ExternalLink'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { routes } from 'core/utils/routes'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'
import AwsAvailabilityZoneChooser from 'k8s/components/infrastructure/cloudProviders/AwsAvailabilityZoneChooser'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { PromptToAddProvider } from 'k8s/components/infrastructure/cloudProviders/PromptToAddProvider'
import { awsPrerequisitesLink } from 'k8s/links'
import Text from 'core/elements/text'
import ClusterSettingsCard from '../../form-components/ClusterSettingsCard'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import cloudProvider from '../../form-components/cloud-provider'
import Name from '../../form-components/name'

export const templateTitle = 'One Click'

const useStyles = makeStyles((theme: Theme) => ({
  field: {
    margin: theme.spacing(2, 0, 1),
    maxWidth: 'none',
  },
}))

const OneClickAwsCluster = ({wizardContext, setWizardContext}) => {
  const classes = useStyles()
  return (
    <>
      <ValidatedForm
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        // triggerSubmit={onNext}
        title="Configure Your Cluster"
      >
          <Name setWizardContext></Name>

        {({ setFieldValue, values }) => (
          <>
            <FormFieldCard
              title="Cluster Configuration"
              link={
                <ExternalLink url={awsPrerequisitesLink}>
                  <Text variant="caption2">AWS Cluster Help</Text>
                </ExternalLink>
              }
            >
              {/* Cluster Name */}
              <TextField id="name" label="Name" info="Name of the cluster" required />
              <name setWizardContext={setWizardContext}/>

           <CloudPro>

              {/* AWS Availability Zone */}
              {values.region && (
                <AwsAvailabilityZoneChooser
                  id="azs"
                  info="Select from the Availability Zones for the specified region"
                  cloudProviderId={params.cloudProviderId}
                  cloudProviderRegionId={wizardContext.cloudProviderRegionId}
                  onChange={(value) => setWizardContext({ azs: value })}
                  values={wizardContext.azs}
                  type="aws"
                  required
                />
              )}

              {/* SSH Key */}
              <PicklistField
                DropdownComponent={AwsClusterSshKeyPicklist}
                disabled={!(params.cloudProviderId && wizardContext.cloudProviderRegionId)}
                id="sshKey"
                label="SSH Key"
                cloudProviderId={params.cloudProviderId}
                cloudProviderRegionId={wizardContext.cloudProviderRegionId}
                info="Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes."
                required
              />

              {/* Template Chooser */}
              <PicklistField
                id="template"
                label="Cluster Template"
                options={templateOptions}
                onChange={handleTemplateChoice({
                  setWizardContext,
                  setFieldValue,
                  paramUpdater: getParamsUpdater('template'),
                })}
              />

              {params.template === 'custom' && (
                <>
                  {/* Operating System */}
                  <PicklistField
                    id="ami"
                    label="Operating System"
                    options={operatingSystemOptions}
                    info="Operating System / AMI"
                    required
                  />

                  {/* Master node instance type */}
                  <PicklistField
                    DropdownComponent={AwsRegionFlavorPicklist}
                    disabled={!(params.cloudProviderId && wizardContext.cloudProviderRegionId)}
                    id="masterFlavor"
                    label="Master Node Instance Type"
                    cloudProviderId={params.cloudProviderId}
                    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
                    info="Choose an instance type used by master nodes."
                    required
                  />

                  {/* Num master nodes */}
                  <PicklistField
                    id="numMasters"
                    options={numMasterOptions}
                    label="Number of master nodes"
                    info="Number of master nodes to deploy.  3 nodes are required for an High Availability (HA) cluster."
                    required
                  />

                  {/* Worker node instance type */}
                  <PicklistField
                    DropdownComponent={AwsRegionFlavorPicklist}
                    disabled={!(params.cloudProviderId && wizardContext.cloudProviderRegionId)}
                    id="workerFlavor"
                    label="Worker Node Instance Type"
                    cloudProviderId={params.cloudProviderId}
                    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
                    info="Choose an instance type used by worker nodes."
                    required
                  />

                  {/* Num worker nodes */}
                  <TextField
                    id="numWorkers"
                    type="number"
                    label="Number of worker nodes"
                    info="Number of worker nodes to deploy."
                    required
                  />

                  {/* Workloads on masters */}
                  <CheckboxField
                    id="allowWorkloadsOnMaster"
                    label="Enable workloads on all master nodes"
                    info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                  />

                  {/* Enable Auto Scaling */}
                  <CheckboxField
                    id="enableCAS"
                    label="Enable Auto Scaling"
                    info="The cluster may scale up to the max worker nodes specified. Auto scaling may not be used with spot instances."
                  />

                  {/* Max num worker nodes (autoscaling) */}
                  {values.enableCAS && (
                    <TextField
                      id="numMaxWorkers"
                      type="number"
                      label="Maximum number of worker nodes"
                      info="Maximum number of worker nodes this cluster may be scaled up to."
                      required={values.enableCAS}
                    />
                  )}
                </>
              )}
            </FormFieldCard>
            <ClusterSettingsCard
              className={classes.field}
              wizardContext={wizardContext}
              setWizardContext={setWizardContext}
            />
          </>
        )}
      </ValidatedForm>
      ) : (
      <FormFieldCard title="Configure Your Cluster">
        <PromptToAddProvider
          type={CloudProviders.Aws}
          src={routes.cloudProviders.add.path({ type: CloudProviders.Aws })}
        />
      </FormFieldCard>
    </>
  )
}

export default OneClickAwsCluster

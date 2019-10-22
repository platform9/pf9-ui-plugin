import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import BareOsClusterReviewTable from './BareOsClusterReviewTable'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import { clusterActions } from '../actions'
import { pick } from 'ramda'

const initialContext = {
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'flannel',
  runtimeConfigOption: 'default',
}

const runtimeConfigOptions = [
  { label: 'Default API groups and versions', value: 'default' },
  { label: 'All API groups and versions', value: 'all' },
  { label: 'Custom', value: 'custom' },
]

const AddBareOsClusterPage = () => {
  const { params } = useParams()
  const { history } = useReactRouter()
  const onComplete = () => {
    history.push('/ui/kubernetes/infrastructure#clusters')
  }
  const [create] = useDataUpdater(clusterActions.create, onComplete)

  const handleSubmit = params => async data => {
    const body = {
      // basic info
      ...pick('nodePoolUuid name location zones sshKey'.split(' '), data),

      // cluster configuration
      ...pick('allowWorkloadsOnMaster'.split(' '), data),

      // network info
      ...pick('assignPublicIps masterSubnetName workerSubnetName externalDnsName serviceFqdn containersCidr servicesCidr networkPlugin'.split(' '), data),

      // advanced configuration
      ...pick('privileged appCatalogEnabled customAmi tags'.split(' '), data),
    }
    if (data.httpProxy) { body.httpProxy = data.httpProxy }
    if (data.networkPlugin === 'calico') { body.mtuSize = data.mtuSize }

    data.runtimeConfig = {
      default: '',
      all: 'api/all=true',
      custom: data.customRuntimeConfig,
    }[data.runtimeConfigOption]

    await create(body)
    return body
  }

  return (
    <Wizard onComplete={handleSubmit(params)} context={initialContext}>
      {({ wizardContext, setWizardContext, onNext }) => {
        return (
          <>
            <WizardStep stepId="basic" label="Basic Info">
              <FormWrapper title="Add Cluster">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Cluster Name */}
                      <TextField
                        id="name"
                        label="Name"
                        info="Name of the cluster"
                        required
                      />

                      {/* SSH Key */}
                      <TextField
                        id="sshKey"
                        label="Public SSH key"
                        info="Copy/paste your public SSH key"
                        multiline
                        rows={3}
                        required
                      />

                      {/* TODO: select master nodes */}
                    </>
                  )}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="workers" label="Woker Nodes">
              <FormWrapper title="Worker Nodes">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* TODO: select worker nodes */}
                    </>
                  )}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="network" label="Network Info">
              <FormWrapper title="Network Info">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      <TextField
                        id="masterVipIpv4"
                        label="Virtual IP address for cluster"
                        info=""
                        required
                      />

                      <TextField
                        id="masterVipIface"
                        label="Physical interface for virtual IP association"
                        info=""
                        required
                      />

                      {/* Assign public IP's */}
                      <CheckboxField
                        id="enableMetallb"
                        label="Enable MetalLB"
                        info=""
                      />

                      {values.enableMetallb &&
                        <TextField
                          id="metalLbCidr"
                          label="Address pool for MetalLB Load Balancer"
                          info=""
                          required
                        />
                      }

                      {/* API FQDN */}
                      <TextField
                        id="externalDnsName"
                        label="API FQDN"
                        info="FQDN used to reference cluster API. To ensure the API can be accessed securely at the FQDN, the FQDN will be included in the API server certificate's Subject Alt Names. If deploying onto AWS, we will automatically create the DNS records for this FQDN into AWS Route 53."
                        required
                      />

                      {/* Containers CIDR */}
                      <TextField
                        id="containersCidr"
                        label="Containers CIDR"
                        info="Defines the network CIDR from which the flannel networking layer allocates IP addresses to Docker containers. This CIDR should not overlap with the VPC CIDR. Each node gets a /24 subnet. Choose a CIDR bigger than /23 depending on the number of nodes in your cluster. A /16 CIDR gives you 256 nodes."
                        required
                      />

                      {/* Services CIDR */}
                      <TextField
                        id="servicesCidr"
                        label="Services CIDR"
                        info="Defines the network CIDR from which Kubernetes allocates virtual IP addresses to Services.  This CIDR should not overlap with the VPC CIDR."
                        required
                      />

                      {/* HTTP proxy */}
                      <TextField
                        id="httpProxy"
                        label="HTTP Proxy"
                        info="Specify the HTTP proxy for this cluster.  Leave blank for none.  Uses format of <scheme>://<username>:<password>@<host>:<port> where <username>:<password>@ is optional."
                      />
                    </>
                  )}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="advanced" label="Advanced Configuration">
              <FormWrapper title="Advanced Configuration">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Privileged */}
                      <CheckboxField
                        id="privileged"
                        label="Privileged"
                        disabled={['calico', 'canal', 'weave'].includes(values.networkPlugin)}
                        info="Allows this cluster to run privileged containers. Read this article for more information."
                      />

                      {/* Advanced API Configuration */}
                      <PicklistField
                        id="runtimeConfigOption"
                        label="Advanced API Configuration"
                        options={runtimeConfigOptions}
                        info="Make sure you are familiar with the Kubernetes API configuration documentation before enabling this option."
                        required
                      />

                      {values.runtimeConfigOption === 'custom' &&
                        <TextField
                          id="customRuntimeConfig"
                          label="Custom API Configuration"
                          info=""
                        />
                      }

                      {/* Enable Application Catalog */}
                      <CheckboxField
                        id="appCatalogEnabled"
                        label="Enable Application Catalog"
                        info="Enable the Helm Application Catalog on this cluster"
                      />

                      {/* Tags */}
                      <KeyValuesField
                        id="tags"
                        label="Tags"
                        info="Add tag metadata to this cluster"
                      />
                    </>
                  )}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="review" label="Review">
              <FormWrapper title="Review">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  <BareOsClusterReviewTable data={wizardContext} />
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>
          </>
        )
      }}
    </Wizard>
  )
}

export default AddBareOsClusterPage

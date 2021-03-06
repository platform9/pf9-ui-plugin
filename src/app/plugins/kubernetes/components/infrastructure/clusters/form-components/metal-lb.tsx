import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { IconInfo } from 'core/components/validatedForm/Info'
import TextField from 'core/components/validatedForm/TextField'
import MetalLbModePicklist, { MetalLbModes } from 'k8s/components/common/metal-lb-mode-picklist'
import ExternalLink from 'core/components/ExternalLink'
import { applicationLoadBalancer } from 'k8s/links'
import BulletList from 'core/components/BulletList'
import { ipValidators } from './validators'

const handleMetallbChange = (value, wizardContext) => ({
  enableMetallb: value,
  privileged: value ? true : wizardContext?.privileged,
})

const MetalLbField = ({ label = 'Enable MetalLB', wizardContext, setWizardContext }) => (
  <CheckboxField
    id="enableMetallb"
    label={label}
    infoPlacement="right-end"
    onChange={(value) => setWizardContext(handleMetallbChange(value, wizardContext))}
    value={wizardContext?.enableMetallb}
    info="Platform9 uses MetalLB for bare metal service level load balancing. Enabling MetalLB will provide the ability to create services of type load-balancer."
  />
)

export const MetalLbLayer2Field = ({ wizardContext, setWizardContext }) => (
  <MetalLbField
    label="Deploy MetalLB - Layer 2 Mode"
    wizardContext={wizardContext}
    setWizardContext={setWizardContext}
  />
)
export const MetalLbAddonLayer2Field = () => (
  <MetalLbAddonCard>
    <MetalLbCidrField />
  </MetalLbAddonCard>
)

const MetalLbCidrField = () => (
  <KeyValuesField
    required
    id="metallbCidr"
    label="Address Pool Range"
    keyLabel="Start Address"
    valueLabel="End Address"
  />
)
export const MetalLbAddonField = ({ values }) => (
  <MetalLbAddonCard>
    <PicklistField
      required
      DropdownComponent={MetalLbModePicklist}
      id="metallbMode"
      label="Metal Lb Mode"
    />
    {values.metallbMode === MetalLbModes.Layer2Mode && <MetalLbCidrField />}
    {values.metallbMode === MetalLbModes.BGPMode && (
      <>
        <TextField id="metallbRouterIp" label="Router IP Address" required />
        <TextField id="metallbRouterAS" label="Router's AS Number" required />
        <TextField id="metallbAS" label="AS Number For MetalLb" required />
        <TextField
          id="metallbCidr"
          label="Address Pool CIDR"
          // info="Network CIDR from which Kubernetes allocates IP addresses to containers. This CIDR shouldn't overlap with the VPC CIDR. A /16 CIDR enables 256 nodes."
          required
          validations={[ipValidators?.[values.networkStack]?.ipValidator]}
        />
      </>
    )}
  </MetalLbAddonCard>
)
export const MetalLbAddonCard = ({ children }) => {
  return (
    <FormFieldCard
      title="Metal Lb Configuration"
      link={
        <ExternalLink textVariant="caption2" url={applicationLoadBalancer}>
          Advanced Configuration: MetalLB Help
        </ExternalLink>
      }
    >
      <IconInfo icon="info-circle" title="MetalLB is a software load balancer." spacer={false}>
        <BulletList
          items={[
            'Ensure firewalls are configured to allow ingress and egress traffic for the virtual IP.',
            'Ensure the Address Pool is a reserved Network IP Range to avoid IP Conflicts',
          ]}
        />
      </IconInfo>
      {children}
    </FormFieldCard>
  )
}

export default MetalLbField

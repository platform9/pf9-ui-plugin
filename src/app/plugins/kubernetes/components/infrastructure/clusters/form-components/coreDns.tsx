import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

export const coreDnsFieldId = 'enableCoreDns'

const CoreDns = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id={coreDnsFieldId}
    label="CoreDNS"
    infoPlacement="right-end"
    value={wizardContext[coreDnsFieldId]}
    onChange={(value) => setWizardContext({ [coreDnsFieldId]: value })}
    info="CoreDNS"
  />
)

export const CoreDnsAddonFields = () => (
  <FormFieldCard title="CoreDNS Configuration">
    <TextField id="dnsMemoryLimit" label="DNS Memory Limit" initialValue="170Mi" required />
    <TextField id="dnsDomain" label="DNS Domain" initialValue="cluster.local" required />
    <TextField id="base64EncAdditionalDnsConfig" label="Base 64 Encoding Additional DNS Config" />
  </FormFieldCard>
)

export default CoreDns

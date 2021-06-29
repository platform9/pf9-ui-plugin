import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

const CoreDns = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id="coreDns"
    label="CoreDNS"
    infoPlacement="right-end"
    value={wizardContext.coreDns}
    onChange={(value) => setWizardContext({ coreDns: value })}
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

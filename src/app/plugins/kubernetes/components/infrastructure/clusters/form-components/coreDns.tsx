import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import React, { useContext } from 'react'
import TextField from 'core/components/validatedForm/TextField'
import { EditClusterContext } from '../EditClusterPage'

export const coreDnsFieldId = 'coreDns'
const defaultDnsMemoryLimit = '170Mi'
const defaultDnsDomain = 'cluster.local'

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

export const CoreDnsAddonFields = () => {
  const {
    wizardContext,
    setWizardContext,
  }: { wizardContext: any; setWizardContext: any } = useContext(EditClusterContext) as any

  return (
  <FormFieldCard title="CoreDNS Configuration">
    <TextField 
      id="dnsMemoryLimit" 
      label="DNS Memory Limit" 
      initialValue={defaultDnsMemoryLimit}
      value={wizardContext.dnsMemoryLimit} 
      onChange={(value) => setWizardContext({dnsMemoryLimit: value})} 
      required 
    />
    <TextField 
      id="dnsDomain" 
      label="DNS Domain" 
      initialValue={defaultDnsDomain}
      value={wizardContext.dnsDomain} 
      onChange={(value) => setWizardContext({dnsDomain: value})} 
      required 
      />
    <TextField 
      id="base64EncAdditionalDnsConfig" 
      label={"Base 64 Encoding Additional DNS Config"} 
      value={wizardContext.base64EncAdditionalDnsConfig} 
      onChange={(value) => setWizardContext({base64EncAdditionalDnsConfig: value})}
    />
  </FormFieldCard>)
}

export default CoreDns

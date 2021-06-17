import TextField from 'core/components/validatedForm/TextField'
import React from 'react'

const ServicesFqdnField = ({ setWizardContext, wizardContext, required, disabled }) => (
  <TextField
    id="serviceFqdn"
    label="Services FQDN"
    infoPlacement="right-end"
    info="FQDN used to reference cluster services. If deploying onto AWS, we will automatically create the DNS records for this FQDN into AWS Route 53."
    value={wizardContext.serviceFqdn}
    onChange={(value) => setWizardContext({ serviceFqdn: value })}
    required={required}
    disabled={disabled}
  />
)

export default ServicesFqdnField

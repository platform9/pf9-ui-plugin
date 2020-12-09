import TextField from 'core/components/validatedForm/TextField'
import React from 'react'

const ApiFqdnField = ({ setWizardContext, wizardContext, disabled = false, required = true }) => (
  <TextField
    id="externalDnsName"
    label="API FQDN"
    info="Fully Qualified Domain Name used to reference the cluster API. The API will be secured by including the FQDN in the API server certificate’s Subject Alt Names. Clusters in Public Cloud will automatically have the DNS records created and registered for the FQDN."
    infoPlacement="right-end"
    value={wizardContext.externalDnsName}
    onChange={(value) => setWizardContext({ externalDnsName: value })}
    required={required}
    disabled={disabled}
  />
)

export default ApiFqdnField

import TextField from 'core/components/validatedForm/TextField'
import React from 'react'

const ServicesFqdnField = ({ usePf9Domain }) => (
  <TextField
    id="serviceFqdn"
    label="Services FQDN"
    infoPlacement="right-end"
    info="FQDN used to reference cluster services. If deploying onto AWS, we will automatically create the DNS records for this FQDN into AWS Route 53."
    required={!usePf9Domain}
    disabled={usePf9Domain}
  />
)

export default ServicesFqdnField

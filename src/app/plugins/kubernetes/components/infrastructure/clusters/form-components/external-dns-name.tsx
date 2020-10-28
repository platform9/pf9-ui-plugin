import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

const ApiFQDNField = () => (
  <TextField
    id="externalDnsName"
    label="API FQDN"
    infoPlacement="right-end"
    info="Fully Qualified Domain Name used to reference the cluster API. The API will be secured by including the FQDN in the API server certificate’s Subject Alt Names. Clusters in Public Cloud will automatically have the DNS records created and registered for the FQDN."
  />
)

export default ApiFQDNField

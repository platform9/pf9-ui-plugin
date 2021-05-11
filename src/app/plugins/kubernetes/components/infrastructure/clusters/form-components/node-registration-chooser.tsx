import RadioFields from 'core/components/validatedForm/radio-fields'
import React from 'react'

const formKey = 'nodeRegistrationType'

const nodeRegistrationOptions = [
  {
    label: 'Use Node IP address for Cluster Creation',
    value: 'ipAddress',
    info:
      'Warning: DNS Resolution must be working to use Hostname. Failure to resolve a hostname will result in cluster error.',
  },
  { label: 'Use Node Hostname for Cluster Creation ', value: 'hostname' },
]

const NodeRegistrationChooser = ({ wizardContext, setWizardContext }) => {
  const handleChange = (value) => {
    const useHostname = value === 'hostname'
    setWizardContext({ useHostname, [formKey]: value })
  }

  return (
    <RadioFields
      id={formKey}
      value={wizardContext[formKey]}
      options={nodeRegistrationOptions}
      onChange={handleChange}
    />
  )
}

export default NodeRegistrationChooser

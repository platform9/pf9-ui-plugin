import RadioFields from 'core/components/validatedForm/radio-fields'
import React from 'react'

const networkStackOptions = [
  { label: 'IPv4', value: 'ipv4' },
  { label: 'IPv6', value: 'ipv6' },
  { label: 'DualStack', value: 'dualstack' },
]

const formKey = 'networkStack'

export default function NetworkStackChooser({ wizardContext, setWizardContext }) {
  return (
    <RadioFields
      id={formKey}
      value={wizardContext[formKey]}
      options={networkStackOptions}
      onChange={(changeValue) => setWizardContext({ [formKey]: changeValue })}
    />
  )
}

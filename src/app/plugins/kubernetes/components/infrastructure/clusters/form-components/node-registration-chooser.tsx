import RadioFields, { OptionType } from 'core/components/validatedForm/radio-fields'
import React, { useEffect, useMemo } from 'react'
import { NetworkStackTypes } from '../constants'

const NodeRegistrationChooser = ({ values, wizardContext, setWizardContext }) => {
  const nodeRegistrationOptions: Array<OptionType> = useMemo(() => {
    return [
      {
        label: 'Use Node IP address for Cluster Creation',
        value: 'ipAddress',
      },
      {
        label: 'Use Node Hostname for Cluster Creation ',
        value: 'hostname',
        disabled: wizardContext.networkStack === NetworkStackTypes.IPv6,
        info:
          'Warning: DNS Resolution must be working to use Hostname. Failure to resolve a hostname will result in cluster error.',
      },
    ]
  }, [wizardContext.networkStack])

  useEffect(() => {
    // If a user selects IPv6, we need to automatically select the ipAddress option
    if (values.networkStack === NetworkStackTypes.IPv6) {
      setWizardContext({ useHostname: false, nodeRegistrationType: 'ipAddress' })
    }
  }, [values.networkStack])

  const handleChange = (value) => {
    // useHostname is a flag that is used by the cluster creation API
    // nodeRegistrationType is just used by the UI to keep track of which type the user chooses
    const useHostname = value === 'hostname'
    setWizardContext({ useHostname, nodeRegistrationType: value })
  }

  return (
    <RadioFields
      id="nodeRegistrationType"
      value={wizardContext.nodeRegistrationType}
      options={nodeRegistrationOptions}
      onChange={handleChange}
    />
  )
}

export default NodeRegistrationChooser

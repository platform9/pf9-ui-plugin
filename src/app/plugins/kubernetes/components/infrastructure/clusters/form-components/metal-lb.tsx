import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import MetalLbModePicklist, { MetalLbModes } from 'k8s/components/common/metal-lb-mode-picklist'

const MetalLbField = () => (
  <CheckboxField
    id="enableMetallb"
    label="Enable MetalLB"
    infoPlacement="right-end"
    info="Platform9 uses MetalLB for bare metal service level load balancing. Enabling MetalLB will provide the ability to create services of type load-balancer."
  />
)

const MetalLbCidrField = () => (
  <KeyValuesField
    required
    id="metallbCidr"
    label="Address Pool Range"
    keyLabel="Start Address"
    valueLabel="End Address"
  />
)

export const MetalLbAddonField = ({ values }) => {
  return (
    <FormFieldCard title="Metal Lb Configuration">
      <PicklistField
        required
        DropdownComponent={MetalLbModePicklist}
        id="metallbMode"
        label="Metal Lb Mode"
      />
      {values.metallbMode === MetalLbModes.Layer2Mode && <MetalLbCidrField />}
      {values.metallbMode === MetalLbModes.BGPMode && (
        <>
          <TextField id="metallbRouterIp" label="Router IP Address" required />
          <TextField id="metallbRouterAS" label="Router's AS Number" required />
          <TextField id="metallbAS" label="AS Number For MetalLb" required />
          <MetalLbCidrField />
        </>
      )}
    </FormFieldCard>
  )
}

export default MetalLbField

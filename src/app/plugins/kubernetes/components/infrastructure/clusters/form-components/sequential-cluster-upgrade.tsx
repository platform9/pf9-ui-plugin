import React from 'react'
import { handleSetUpgradeStrategy } from '../UpgradeClusterPage'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

const SequentialClusterUpgradeField = ({ wizardContext, setWizardContext }) => {
  return (
    <>
      <CheckboxField
        id="sequentialClusterUpgrade"
        label="Sequential"
        infoPlacement="right-end"
        onChange={(value) =>
          setWizardContext(handleSetUpgradeStrategy(value, 'sequentialClusterUpgrade'))
        }
        value={wizardContext?.sequentialClusterUpgrade}
        info="List: The specified worker nodes will be upgraded in parallel."
      />
    </>
  )
}

export const SequentialClusterUpgradeAddonField = () => {
  return null
}

export default SequentialClusterUpgradeField

import React, { useEffect, useState } from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { compareVersions } from 'k8s/components/app-catalog/helpers'

const ProfileEngine = ({ wizardContext, setWizardContext }) => {
  const [showCheckbox, setShowCheckbox] = useState(false)

  useEffect(() => {
    if (!wizardContext.kubeRoleVersion) return
    // If the kubernetes version is >= 1.20, show the checkbox field
    if (compareVersions(wizardContext.kubeRoleVersion, '1.20') >= 0) {
      setShowCheckbox(true)
    } else {
      setShowCheckbox(false)
      setWizardContext({ enableProfileAgent: false })
    }
  }, [wizardContext.kubeRoleVersion])

  return (
    <>
      {showCheckbox ? (
        <CheckboxField
          id="enableProfileAgent"
          label="Profile Engine"
          info="Simplfy cluster governance using the Platform9 Profile Engine"
          onChange={(value) => setWizardContext({ enableProfileAgent: value })}
          value={wizardContext.enableProfileAgent}
        />
      ) : null}
    </>
  )
}

export default ProfileEngine

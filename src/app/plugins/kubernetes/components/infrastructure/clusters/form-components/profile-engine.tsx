import React, { useEffect } from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

const ProfileEngine = ({ wizardContext, setWizardContext }) => {
  useEffect(() => {
    console.log(wizardContext)
    // If kubeRoleVersion is < 1.2 then hide this component and set value to false
  }, [wizardContext.kubeRoleVersion])

  return (
    <CheckboxField
      id="enableProfileAgent"
      label="Profile Engine"
      info="Simplfy cluster governance using the Platform9 Profile Engine"
      onChange={(value) => setWizardContext({ enableProfileAgent: value })}
      value={wizardContext.enableProfileAgent}
    />
  )
}

export default ProfileEngine

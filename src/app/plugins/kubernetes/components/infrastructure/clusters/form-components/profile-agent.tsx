import React, { useEffect, useMemo } from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { compareVersions } from 'k8s/util/helpers'

const ProfileAgent = ({ wizardContext, setWizardContext }) => {
  const isNewK8sVersion = useMemo(() => {
    if (!wizardContext.kubeRoleVersion) {
      return false
    }
    return compareVersions(wizardContext.kubeRoleVersion, '1.20') >= 0
  }, [wizardContext.kubeRoleVersion])

  useEffect(() => {
    if (!isNewK8sVersion) {
      setWizardContext({ enableProfileAgent: false })
    }
  }, [isNewK8sVersion])

  return (
    <>
      {isNewK8sVersion ? (
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

export default ProfileAgent

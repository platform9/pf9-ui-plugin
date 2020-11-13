import React from 'react'
import ExternalLink from 'core/components/ExternalLink'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { runtimePrivilegedLink } from 'k8s/links'

const PrivilegedContainers = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id="privileged"
    label="Privileged Containers"
    disabled={['calico', 'canal', 'weave'].includes(wizardContext.networkPlugin)}
    onChange={(value) => setWizardContext({ privileged: value })} // other fields need to set this field, so it also needs to be controlled
    value={wizardContext.privileged}
    info={
      <div>
        Allows this cluster to run privileged containers. Read{' '}
        <ExternalLink url={runtimePrivilegedLink}>this article</ExternalLink> for more information.
        This is required for Calico CNI and CSI.
      </div>
    }
  />
)

export default PrivilegedContainers

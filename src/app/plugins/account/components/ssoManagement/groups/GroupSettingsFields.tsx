import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

interface Props {
  wizardContext: any
  setWizardContext: any
}

const GroupSettingsFields = ({ wizardContext, setWizardContext }: Props) => (
  <>
    <TextField
      id="name"
      label="Name"
      onChange={(value) => setWizardContext({ name: value })}
      value={wizardContext.name}
      required
    />
    <TextField
      id="description"
      label="Description"
      onChange={(value) => setWizardContext({ description: value })}
      value={wizardContext.description}
      required
    />
    <TextField
      id="firstNameKey"
      label="SAML Attribute Key for a User's First Name"
      onChange={(value) => setWizardContext({ firstNameKey: value })}
      value={wizardContext.firstNameKey}
      info="The SAML Attribute Key defined to capture a SAML user's first name in your Identity Provider. This field, along with the 'last name' field is used to identify a user when they log in."
      required
    />
    <TextField
      id="lastNameKey"
      label="SAML Attribute Key for a User's Last Name"
      onChange={(value) => setWizardContext({ lastNameKey: value })}
      value={wizardContext.lastNameKey}
      info="The SAML Attribute Key defined to capture a SAML user's last name in your Identity Provider. This field, along with the 'first name' field is used to identify a user when they log in."
      required
    />
    <TextField
      id="emailKey"
      label="SAML Attribute Key for a User's Email"
      onChange={(value) => setWizardContext({ emailKey: value })}
      value={wizardContext.emailKey}
      info="The SAML Attribute Key defined to capture a SAML user's email in your Identity Provider. This field, is used to identify a user when they log in."
      required
    />
  </>
)

export default GroupSettingsFields

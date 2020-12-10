import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import DocumentMeta from 'core/components/DocumentMeta'
import SsoToggle from './SsoToggle'
import TextField from 'core/components/validatedForm/TextField'
import SsoProviderPicklist from './SsoProviderPicklist'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import UploadSamlMetadataLink from './UploadSamlMetadataLink'
import Button from 'core/elements/button'
import CopyToClipboard from 'core/components/CopyToClipboard'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  ssoPage: {
    marginTop: theme.spacing(3),
  },
  wizardLabel: {
    margin: theme.spacing(1, 0),
  },
  textArea: {
    width: '100% !important',
  },
  field: {
    display: 'flex',
    alignItems: 'center',
  },
  orLabel: {
    margin: theme.spacing(0, 3),
  },
  attributeMapButtons: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'max-content',
    gridGap: theme.spacing(2),
  },
  outlinedButton: {
    background: theme.palette.grey['000'],
    border: `1px solid ${theme.palette.blue[500]}`,
    color: theme.palette.blue[500],
  },
  copyIcon: {
    marginRight: theme.spacing(0.5),
  },
  copyButton: {
    marginLeft: theme.spacing(4),
  },
}))

const customCodeMirrorOptions = {
  mode: 'xml',
}

const updateSsoSettings = (data) => {
  const sendRequests = async () => {
    // If SSO config already exists, delete old one and create a new one
    // Otherwise just create a new one
    const body = {
      provider: data.provider,
      entity_id: data.entityId,
      metadataUrl: data.metadataUrl,
      metadata: data.metadataUrl ? undefined : data.metadata,
      attr_map_xml: data.defaultAttributeMap,
    }
    console.log(body)
    // Todo: update SSO config here
    // Need some kind of indication that the save was successful. Maybe alter the save button to say saved and then disable it?
  }

  sendRequests()
}

const updateMetadataUrl = (value, setWizardContext) => {
  // Also need to GET the url and populate the textarea
  setWizardContext({ metadataUrl: value })
}

const SsoPage = () => {
  const classes = useStyles({})

  const [initialContext] = useState<any>({ enableSso: false })

  // Todo:
  // Query for sso config and prepopulate it here
  // Need a loading signal for this... wrap it in a Progress component
  // Add a modal for verifying turning off SSO when flipping switch off when a config is present
  // Do not use Wizard here, just use ValidatedForm by itself

  return (
    <div className={classes.ssoPage}>
      <DocumentMeta title="SSO Management" bodyClasses={['form-view']} />
      {initialContext && (
        <Wizard
          onComplete={updateSsoSettings}
          context={initialContext}
          submitLabel="Save"
          showSteps={false}
          showFinishAndReviewButton={false}
          singleStep
        >
          {({ wizardContext, setWizardContext, onNext, handleNext }) => {
            return (
              <WizardStep stepId="step1" label="Update Cloud Provider">
                <div>
                  <ValidatedForm
                    classes={{ root: classes.validatedFormContainer }}
                    initialValues={wizardContext}
                    elevated={false}
                    onSubmit={handleNext}
                  >
                    <FormFieldCard title="Enterprise Single Sign On">
                      <Text variant="body2">
                        Enterprise Single Sign On supports SAML 2.0 identity integration for
                        seamless access to your Platform9 instance.
                      </Text>
                      <SsoToggle
                        checked={wizardContext.enableSso}
                        onClick={() => setWizardContext({ enableSso: !wizardContext.enableSso })}
                      ></SsoToggle>
                    </FormFieldCard>
                    {wizardContext.enableSso && (
                      <FormFieldCard title="Configure SSO">
                        <SsoProviderPicklist
                          value={wizardContext.ssoProvider}
                          onChange={(value) => setWizardContext({ ssoProvider: value })}
                          formField
                        ></SsoProviderPicklist>
                        <Text variant="caption1" className={classes.wizardLabel}>
                          Entity Endpoint for your SSO Provider
                        </Text>
                        <TextField
                          id="entityId"
                          label="Entity ID"
                          onChange={(value) => setWizardContext({ entityId: value })}
                          value={wizardContext.entityId}
                          required
                        />
                        <Text variant="caption1" className={classes.wizardLabel}>
                          SAML Metadata (XML) from your SSO Provider
                        </Text>
                        <div className={classes.field}>
                          <TextField
                            id="metadataUrl"
                            label="URL"
                            onChange={(value) => updateMetadataUrl(value, setWizardContext)}
                            value={wizardContext.metadataUrl}
                          />
                          <Text variant="body2" className={classes.orLabel}>
                            or
                          </Text>
                          <UploadSamlMetadataLink setWizardContext={setWizardContext} />
                          <Text variant="body2">{wizardContext.metadataFileName}</Text>
                        </div>
                        <Text variant="caption1" className={classes.wizardLabel}>
                          SSO Provider Attribute MAP in XML
                        </Text>
                        <Text variant="body2">
                          Enterprise Single Sign on supports SAML 2.0 identity integration for
                          seamless access to your Platform9 instance.
                        </Text>
                        <CodeMirror
                          id="defaultAttributeMap"
                          label="Default Attribute Map"
                          options={customCodeMirrorOptions}
                          onChange={(value) => setWizardContext({ defaultAttributeMap: value })}
                          value={wizardContext.defaultAttributeMap}
                        />
                        <div className={classes.attributeMapButtons}>
                          <Button
                            className={classes.outlinedButton}
                            onClick={() => setWizardContext({ defaultAttributeMap: '' })}
                          >
                            Clear XML
                          </Button>
                          <CopyToClipboard
                            copyText={wizardContext.defaultAttributeMap}
                            copyIcon={false}
                            inline={false}
                            triggerWithChild
                          >
                            {
                              // @ts-ignore
                              <Button>
                                <FontAwesomeIcon size="sm" className={classes.copyIcon}>
                                  copy
                                </FontAwesomeIcon>
                                Copy Attribute Map
                              </Button>
                            }
                          </CopyToClipboard>
                        </div>
                      </FormFieldCard>
                    )}
                  </ValidatedForm>
                </div>
              </WizardStep>
            )
          }}
        </Wizard>
      )}
    </div>
  )
}

export default SsoPage

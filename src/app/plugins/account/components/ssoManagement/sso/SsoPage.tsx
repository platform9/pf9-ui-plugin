import React, { useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
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
import useParams from 'core/hooks/useParams'
import SubmitButton from 'core/components/buttons/SubmitButton'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { createSsoConfig, deleteSsoConfig, loadSsoConfig } from './actions'
import Progress from 'core/components/progress/Progress'
import SsoEnabledDialog from './SsoEnabledDialog'
import { SsoProviders } from './model'
import AccountUpgradeDialog from '../../theme/AccountUpgradeDialog'
import { CustomerTiers, ssoEnabledTiers } from 'app/constants'
import { pathOr, prop } from 'ramda'
import { useSelector } from 'react-redux'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { RootState } from 'app/store'

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
  fullWidth: {
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
  filename: {
    marginLeft: theme.spacing(0.5),
  },
}))

interface State {
  enableSso: boolean
  ssoIsEnabled: boolean
  ssoProviderName: string
  defaultAttributeMap: string
  entityId: string
  ssoProvider: string
  metadataUrl?: string
  metadata?: string
  metadataFileName?: string
}

const customCodeMirrorOptions = {
  mode: 'xml',
}

const updateSsoSettings = (data, setLoading, setDialogOpened, updateParams) => {
  const sendRequests = async () => {
    // If SSO config already exists, delete old one and create a new one
    // Otherwise just create a new one
    // Need to do this until backend provides an update method
    if (data.ssoIsEnabled) {
      await deleteSsoConfig()
    }

    const body = {
      provider: data.ssoProvider === SsoProviders.Other ? data.ssoProviderName : data.ssoProvider,
      entity_id: data.entityId,
      metadata_url: data.metadataUrl,
      metadata: data.metadataUrl ? undefined : data.metadata,
      attr_map_xml: data.defaultAttributeMap,
    }
    setLoading(true)
    try {
      await createSsoConfig(body)
      updateParams({ ssoIsEnabled: true })
      // Show user a dialog saying sso configuration successful
      setDialogOpened(true)
    } finally {
      setLoading(false)
    }
  }

  sendRequests()
}

const SsoPage = () => {
  const classes = useStyles({})
  const [loading, setLoading] = useState(true)
  const [dialogOpened, setDialogOpened] = useState(false)
  const [upgradeDialogOpened, setUpgradeDialogOpened] = useState(false)
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { features } = session
  const { params, updateParams, getParamsUpdater } = useParams<State>({
    enableSso: false,
    ssoIsEnabled: false,
    defaultAttributeMap: '',
    entityId: '',
    ssoProvider: '',
    ssoProviderName: '',
  })

  useEffect(() => {
    const getSettings = async () => {
      try {
        const {
          attr_map_xml: defaultAttributeMap,
          entity_id: entityId,
          provider: ssoProvider,
          metadata_url: metadataUrl,
          metadata,
        }: any = await loadSsoConfig()
        updateParams({
          defaultAttributeMap,
          entityId,
          ssoProvider,
          metadataUrl,
          metadata,
          enableSso: true,
          ssoIsEnabled: true,
        })
      } catch (err) {
        console.log(err, 'error')
        updateParams({ ssoIsEnabled: false })
      }
      setLoading(false)
    }
    getSettings()
  }, [])

  const toggleSso = useCallback(async () => {
    if (params.enableSso && params.ssoIsEnabled) {
      await deleteSsoConfig()
      updateParams({ enableSso: false, ssoIsEnabled: false })
      return
    }
    if (
      !params.enableSso &&
      !ssoEnabledTiers.includes(pathOr(CustomerTiers.Freedom, ['customer_tier'], features))
    ) {
      // If SSO is not available for customer tier
      setUpgradeDialogOpened(true)
      return
    }
    updateParams({ enableSso: !params.enableSso })
  }, [params, updateParams, deleteSsoConfig])

  return (
    <div className={classes.ssoPage}>
      <DocumentMeta title="SSO Management" bodyClasses={['form-view']} />
      {upgradeDialogOpened && (
        <AccountUpgradeDialog
          feature="Enterprise SSO"
          onClose={() => setUpgradeDialogOpened(false)}
        />
      )}
      <Progress loading={loading}>
        <ValidatedForm
          classes={{ root: classes.validatedFormContainer }}
          elevated={false}
          formActions={<>{params.enableSso && <SubmitButton>Save</SubmitButton>}</>}
          onSubmit={() => updateSsoSettings(params, setLoading, setDialogOpened, updateParams)}
        >
          <FormFieldCard title="Enterprise Single Sign On">
            <Text variant="body2">
              Enterprise Single Sign On supports SAML 2.0 identity integration for seamless access
              to your Platform9 instance.
            </Text>
            <SsoToggle
              ssoIsEnabled={params.ssoIsEnabled}
              checked={params.enableSso}
              onClick={toggleSso}
            />
          </FormFieldCard>
          {params.enableSso && (
            <FormFieldCard title="Configure SSO">
              <PicklistField
                DropdownComponent={SsoProviderPicklist}
                id="ssoProvider"
                label="SSO Provider"
                onChange={getParamsUpdater('ssoProvider')}
                value={params.ssoProvider}
                required
              />
              {params.ssoProvider === SsoProviders.Other && (
                <TextField
                  id="ssoProviderName"
                  label="SSO Provider Name"
                  onChange={getParamsUpdater('ssoProviderName')}
                  value={params.ssoProviderName}
                  info="Provide a name to identify your SSO provider"
                  required
                />
              )}
              <Text variant="caption1" className={classes.wizardLabel}>
                Entity Endpoint for your SSO Provider
              </Text>
              <TextField
                id="entityId"
                label="Entity ID"
                onChange={getParamsUpdater('entityId')}
                value={params.entityId}
                required
              />
              <Text variant="caption1" className={classes.wizardLabel}>
                SAML Metadata (XML) from your SSO Provider
              </Text>
              <div className={classes.field}>
                <TextField
                  id="metadataUrl"
                  label="URL"
                  onChange={getParamsUpdater('metadataUrl')}
                  value={params.metadataUrl}
                />
                <Text variant="body2" className={classes.orLabel}>
                  or
                </Text>
                <UploadSamlMetadataLink
                  id="metadata"
                  onChange={getParamsUpdater('metadata')}
                  fileNameUpdater={getParamsUpdater('metadataFileName')}
                />
                <Text variant="body2" className={classes.filename}>
                  {params.metadataFileName}
                </Text>
              </div>
              {!params.metadataUrl && params.metadata && (
                <CodeMirror
                  id="metadata"
                  label="SAML Metadata (XML)"
                  options={customCodeMirrorOptions}
                  onChange={getParamsUpdater('metadata')}
                  value={params.metadata}
                  className={classes.fullWidth}
                />
              )}
              <Text variant="caption1" className={classes.wizardLabel}>
                SSO Provider Attribute MAP in XML
              </Text>
              <Text variant="body2">
                Enterprise Single Sign on supports SAML 2.0 identity integration for seamless access
                to your Platform9 instance.
              </Text>
              <CodeMirror
                id="defaultAttributeMap"
                label="Default Attribute Map"
                options={customCodeMirrorOptions}
                onChange={getParamsUpdater('defaultAttributeMap')}
                value={params.defaultAttributeMap}
                className={classes.fullWidth}
              />
              <div className={classes.attributeMapButtons}>
                <Button
                  className={classes.outlinedButton}
                  type="button"
                  onClick={() => updateParams({ defaultAttributeMap: '' })}
                >
                  Clear XML
                </Button>
                <CopyToClipboard
                  copyText={params.defaultAttributeMap}
                  copyIcon={false}
                  inline={false}
                  triggerWithChild
                >
                  {
                    // @ts-ignore
                    <Button type="button">
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
          {dialogOpened && <SsoEnabledDialog onClose={() => setDialogOpened(false)} />}
        </ValidatedForm>
      </Progress>
    </div>
  )
}

export default SsoPage

import React, { useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import DocumentMeta from 'core/components/DocumentMeta'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import useParams from 'core/hooks/useParams'
import Progress from 'core/components/progress/Progress'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import ThemeToggle from './ThemeToggle'
import AccountUpgradeDialog from './AccountUpgradeDialog'
import { CustomerTiers, themeEnabledTiers } from 'app/constants'
import { pathOr, prop } from 'ramda'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'app/store'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import InlineTooltip from 'core/components/InlineTooltip'
import TextField from 'core/components/validatedForm/TextField'
import clsx from 'clsx'
import { hexToRgb, rgbToHex } from 'core/utils/colorHelpers'
import { deleteThemeConfig, getThemeConfig, updateThemeConfig, updateSessionTheme } from './actions'
import ThemeEnabledDialog from './ThemeEnabledDialog'
import { ThemeConfig } from './model'
import { themeActions } from 'core/session/themeReducers'
import { preferencesActions } from 'core/session/preferencesReducers'
import { useTheme } from '@material-ui/core/styles'
import { colorHexValidator } from 'core/utils/fieldValidators'

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  cardContent: {
    margin: theme.spacing(0, 2),
  },
  spaceBelow: {
    marginBottom: theme.spacing(1.5),
  },
  logoContainer: {
    marginTop: theme.spacing(3),
    display: 'grid',
    gridTemplateColumns: '350px auto',
    columnGap: theme.spacing(5),
  },
  logoBackground: {
    border: `1px solid ${theme.palette.grey[300]}`,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 250,
    height: 50,
    background: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    maxHeight: 50,
    maxWidth: 250,
  },
  tooltip: {
    marginTop: theme.spacing(2),
  },
  colorsContainer: {
    display: 'grid',
    marginTop: theme.spacing(4),
    gridTemplateColumns: '200px 260px 260px',
    columnGap: theme.spacing(7),
  },
  pill: {
    display: 'inline-block',
    height: 72,
    width: 160,
    borderRadius: 36,
    background: theme.palette.grey[900],
  },
  pills: {
    // Height of pill + 2nd pill offset
    marginTop: 36,
    height: 112,
    position: 'relative',
  },
  headerPill: {
    background: theme.palette.grey[900],
  },
  sidenavPill: {
    position: 'absolute',
    background: theme.palette.grey[800],
    top: 40,
    left: 40,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  pillText: {
    textTransform: 'uppercase',
    color: theme.palette.grey['000'],
    display: 'inline-block',
    padding: theme.spacing(1, 3),
  },
  rgb: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    columnGap: theme.spacing(1),
  },
  rgbTextField: {
    width: 'initial !important',
    '& .MuiOutlinedInput-root': {
      minWidth: 'initial',
    },
  },
}))

interface State {
  enableTheme: boolean
  themeIsEnabled: boolean
  logoUrl: string
  headerHex: string
  sidenavHex: string
  headerR: string
  headerG: string
  headerB: string
  sidenavR: string
  sidenavG: string
  sidenavB: string
}

const updateTheme = (data, setLoading, setSavedDialogOpened, updateParams, dispatch, theme) => {
  const sendRequest = async () => {
    const body = {
      headerColor: data.headerHex,
      sidenavColor: data.sidenavHex,
      logoUrl: data.logoUrl,
    }
    setLoading(true)
    try {
      await updateThemeConfig(body)
      updateSessionTheme(dispatch, data, theme)
      updateParams({ themeIsEnabled: true })
      // Show user a dialog saying theme configuration successful
      setSavedDialogOpened(true)
    } finally {
      setLoading(false)
    }
  }

  sendRequest()
}

const CustomThemePage = () => {
  const classes = useStyles({})
  const theme: any = useTheme()
  const { params, updateParams, getParamsUpdater } = useParams<State>({
    enableTheme: false,
    themeIsEnabled: false,
    logoUrl: '',
    headerHex: '',
    sidenavHex: '',
    headerR: '',
    headerG: '',
    headerB: '',
    sidenavR: '',
    sidenavG: '',
    sidenavB: '',
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpened, setDialogOpened] = useState(false)
  const [savedDialogOpened, setSavedDialogOpened] = useState(false)
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { features } = session
  const dispatch = useDispatch()

  useEffect(() => {
    const getSettings = async () => {
      try {
        const {
          headerColor: headerHex,
          sidenavColor: sidenavHex,
          logoUrl,
        }: ThemeConfig = await getThemeConfig()
        updateParams({
          headerHex,
          sidenavHex,
          logoUrl,
          enableTheme: true,
          themeIsEnabled: true,
        })
      } catch (err) {
        console.log(err, 'error')
        updateParams({ themeIsEnabled: false })
      }
      setLoading(false)
    }
    getSettings()
  }, [])

  useEffect(() => {
    const headerRgb = hexToRgb(params.headerHex)
    if (headerRgb) {
      updateParams({
        headerR: `${headerRgb.r}`,
        headerG: `${headerRgb.g}`,
        headerB: `${headerRgb.b}`,
      })
    }
  }, [params.headerHex])

  useEffect(() => {
    const sidenavRgb = hexToRgb(params.sidenavHex)
    if (sidenavRgb) {
      updateParams({
        sidenavR: `${sidenavRgb.r}`,
        sidenavG: `${sidenavRgb.g}`,
        sidenavB: `${sidenavRgb.b}`,
      })
    }
  }, [params.sidenavHex])

  useEffect(() => {
    if (params.headerR && params.headerG && params.headerB) {
      updateParams({
        headerHex: rgbToHex(params.headerR, params.headerG, params.headerB),
      })
    }
  }, [params.headerR, params.headerG, params.headerB])

  useEffect(() => {
    if (params.sidenavR && params.sidenavG && params.sidenavB) {
      updateParams({
        sidenavHex: rgbToHex(params.sidenavR, params.sidenavG, params.sidenavB),
      })
    }
  }, [params.sidenavR, params.sidenavG, params.sidenavB])

  const toggleTheme = useCallback(async () => {
    if (params.enableTheme && params.themeIsEnabled) {
      await deleteThemeConfig()
      dispatch(themeActions.clearTheme({}))
      dispatch(
        preferencesActions.updateLogo({
          logoUrl: '',
        }),
      )
      updateParams({ enableTheme: false, themeIsEnabled: false })
      return
    }
    if (
      !params.enableTheme &&
      !themeEnabledTiers.includes(pathOr(CustomerTiers.Freedom, ['customer_tier'], features))
    ) {
      // If custom theme is not available for customer tier
      setDialogOpened(true)
      return
    }
    updateParams({ enableTheme: !params.enableTheme })
  }, [params, updateParams])

  const logoSrc = params.logoUrl || '/ui/images/logo-placeholder.png'

  return (
    <div>
      <DocumentMeta title="Custom Theme" bodyClasses={['form-view']} />
      {dialogOpened && (
        <AccountUpgradeDialog feature="Custom Theme" onClose={() => setDialogOpened(false)} />
      )}
      <Progress loading={loading}>
        <ValidatedForm
          classes={{ root: classes.validatedFormContainer }}
          elevated={false}
          formActions={<>{params.enableTheme && <SubmitButton>Save</SubmitButton>}</>}
          onSubmit={() =>
            updateTheme(params, setLoading, setSavedDialogOpened, updateParams, dispatch, theme)
          }
        >
          <FormFieldCard title="Custom Theming/Branding">
            <div className={classes.cardContent}>
              <Text variant="body2" className={classes.spaceBelow}>
                Add your own logo & colors to create a custom theming and branding.
              </Text>
              <ThemeToggle
                themeIsEnabled={params.themeIsEnabled}
                checked={params.enableTheme}
                onClick={toggleTheme}
              />
            </div>
          </FormFieldCard>
          {params.enableTheme && (
            <>
              <FormFieldCard title="Logo">
                <div className={classes.cardContent}>
                  <Text variant="body2">Upload your logo.</Text>
                  <div className={classes.logoContainer}>
                    <div>
                      <div
                        className={classes.logoBackground}
                        style={{ background: params.headerHex.length === 7 && params.headerHex }}
                      >
                        <div className={classes.imageContainer}>
                          <img src={logoSrc} className={classes.logoImage} />
                        </div>
                      </div>
                      <InlineTooltip className={classes.tooltip} iconSize="md">
                        <Text variant="caption3">
                          Select custom header background color below to view your logo on proper
                          color above.
                        </Text>
                      </InlineTooltip>
                    </div>
                    <div>
                      <TextField
                        id="logoUrl"
                        label="Logo Image URL"
                        onChange={getParamsUpdater('logoUrl')}
                        value={params.logoUrl}
                        info="Provide a link to the desired image for your logo."
                      />
                      <Text variant="caption3">Requirements</Text>
                      <Text variant="caption3">Max size: 250px x 50px</Text>
                    </div>
                  </div>
                </div>
              </FormFieldCard>
              <FormFieldCard title="Colors">
                <div className={classes.cardContent}>
                  <Text variant="body2">
                    Select a color for your header & side nav. The header color will be used for the
                    header background on all screens. Side nav color selection is optional. If none
                    is selected, the color will default to a shade lighter of the header color.
                  </Text>
                  <div className={classes.colorsContainer}>
                    <div>
                      <div className={classes.pills}>
                        <div
                          className={clsx(classes.pill, classes.headerPill)}
                          style={{ background: params.headerHex.length === 7 && params.headerHex }}
                        >
                          <Text variant="caption3" className={classes.pillText}>
                            Header
                          </Text>
                        </div>
                        <div
                          className={clsx(classes.pill, classes.sidenavPill)}
                          style={{
                            background: params.sidenavHex.length === 7 && params.sidenavHex,
                          }}
                        >
                          <Text variant="caption3" className={classes.pillText}>
                            Side Nav
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Text>Header</Text>
                      <TextField
                        id="headerHex"
                        label="Hex Value"
                        onChange={getParamsUpdater('headerHex')}
                        value={params.headerHex}
                        placeholder="#0d0d28"
                        inputProps={{ maxLength: 7 }}
                        validations={[colorHexValidator]}
                      />
                      <div className={classes.rgb}>
                        <TextField
                          id="headerR"
                          label="R"
                          onChange={getParamsUpdater('headerR')}
                          value={params.headerR}
                          placeholder="13"
                          className={classes.rgbTextField}
                          type="number"
                          inputProps={{ min: 0, max: 255 }}
                        />
                        <TextField
                          id="headerG"
                          label="G"
                          onChange={getParamsUpdater('headerG')}
                          value={params.headerG}
                          placeholder="13"
                          className={classes.rgbTextField}
                          type="number"
                          inputProps={{ min: 0, max: 255 }}
                        />
                        <TextField
                          id="headerB"
                          label="B"
                          onChange={getParamsUpdater('headerB')}
                          value={params.headerB}
                          placeholder="40"
                          className={classes.rgbTextField}
                          type="number"
                          inputProps={{ min: 0, max: 255 }}
                        />
                      </div>
                    </div>
                    <div>
                      <Text>Side nav (Optional)</Text>
                      <TextField
                        id="sidenavHex"
                        label="Hex Value"
                        onChange={getParamsUpdater('sidenavHex')}
                        value={params.sidenavHex}
                        placeholder="#25253f"
                        inputProps={{ maxLength: 7 }}
                        validations={[colorHexValidator]}
                      />
                      <div className={classes.rgb}>
                        <TextField
                          id="sidenavR"
                          label="R"
                          onChange={getParamsUpdater('sidenavR')}
                          value={params.sidenavR}
                          placeholder="37"
                          className={classes.rgbTextField}
                          type="number"
                          inputProps={{ min: 0, max: 255 }}
                        />
                        <TextField
                          id="sidenavG"
                          label="G"
                          onChange={getParamsUpdater('sidenavG')}
                          value={params.sidenavG}
                          placeholder="37"
                          className={classes.rgbTextField}
                          type="number"
                          inputProps={{ min: 0, max: 255 }}
                        />
                        <TextField
                          id="sidenavB"
                          label="B"
                          onChange={getParamsUpdater('sidenavB')}
                          value={params.sidenavB}
                          placeholder="63"
                          className={classes.rgbTextField}
                          type="number"
                          inputProps={{ min: 0, max: 255 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </Progress>
      {savedDialogOpened && <ThemeEnabledDialog onClose={() => setSavedDialogOpened(false)} />}
    </div>
  )
}

export default CustomThemePage

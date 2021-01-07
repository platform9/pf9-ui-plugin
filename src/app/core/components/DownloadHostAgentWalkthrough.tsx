import React, { FC, useEffect, useState } from 'react'
import { Paper, Menu, MenuItem } from '@material-ui/core'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import { hexToRGBA } from 'core/utils/colorHelpers'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import clsx from 'clsx'
import { getDownloadLinks } from 'openstack/components/hosts/actions'
import SubmitButton from './buttons/SubmitButton'
import SimpleLink from './SimpleLink'
import { useSelector } from 'react-redux'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { RootState } from 'app/store'
import { prop } from 'ramda'
import { isDecco } from 'core/utils/helpers'

export enum OsOptions {
  Linux = 'Linux',
  Ubuntu = 'Ubuntu',
}

enum OsDownloadLabel {
  Linux = 'for Enterprise Linux (CentOs/Redhat) 7.6 (64-bit)',
  Ubuntu = 'for Ubuntu 16.04 LTS and Ubuntu 18.04 LTS (64-bit)',
}

enum OsDownloadLinkName {
  Linux = 'rpm_install',
  Ubuntu = 'deb_install',
}

const deccoDownloadOptions = [
  {
    label: OsDownloadLabel[OsOptions.Linux],
    link: `${window.location.origin}/clarity/platform9-install-redhat.sh`,
  },
  {
    label: OsDownloadLabel[OsOptions.Ubuntu],
    link: `${window.location.origin}/clarity/platform9-install-debian.sh`,
  },
]

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2, 8),
    margin: theme.spacing(2, 0),
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
  },
  column: {
    margin: theme.spacing(2, 0),
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    margin: theme.spacing(1, 0),
  },
  step: {
    color: theme.palette.secondary.contrastText,
    marginRight: theme.spacing(2),
    flex: `0 0 ${theme.spacing(5)}px`,
    width: theme.spacing(5),
    height: theme.spacing(5),
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // border: `2px solid ${theme.palette.text.primary}`,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '100%',
    // color: theme.palette.text.primary,
  },
  spacer: {
    margin: theme.spacing(1, 0),
  },
  linkText: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
  },
  fullRow: {
    flex: '0 0 100%',
  },
  wrap: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  downloadIcon: {
    marginLeft: theme.spacing(1),
  },
  spaceAbove: {
    marginTop: theme.spacing(2),
  },
  dropdown: {
    position: 'relative',
  },
}))

const DownloadHostAgentWalkthrough = ({ osOptions }): JSX.Element => {
  const classes = useStyles({})
  const [anchorEl, setAnchorEl] = useState(null)
  const [downloadOptions, setDownloadOptions] = useState([])
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { features } = session
  const isDeccoDU = isDecco(features)

  useEffect(() => {
    const loadDownloadLinks = async () => {
      if (isDeccoDU) {
        setDownloadOptions(deccoDownloadOptions)
        return
      }

      const links = await getDownloadLinks()
      if (!links) return

      // In the future when supporting openstack, will want to show all download links
      const options = osOptions.map((os) => ({
        label: OsDownloadLabel[os],
        link: links[OsDownloadLinkName[os]],
      }))

      setDownloadOptions(options)
    }

    loadDownloadLinks()
  }, [osOptions])

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <Paper className={classes.paper} elevation={0}>
      <Text variant="h6">Install Platform9 Host Agent</Text>
      <NumberedSteps
        step={1}
        description={
          <div className={classes.wrap}>
            <Text className={classes.fullRow}>
              Download the host agent installer for your host operating system version:
            </Text>
            <SubmitButton onClick={handleDownloadClick}>
              Download Installer
              <FontAwesomeIcon className={classes.downloadIcon} size="sm" solid>
                download
              </FontAwesomeIcon>
            </SubmitButton>
            <Menu
              id="download-options"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              {downloadOptions.map((option) => (
                <SimpleLink src={option.link} key={option.label}>
                  <MenuItem onClick={handleMenuClose}>{option.label}</MenuItem>
                </SimpleLink>
              ))}
            </Menu>
          </div>
        }
      />
      <NumberedSteps
        step={2}
        description={
          <Text>
            Copy the installer to your host operating system, or make it available via a shared
            folder.
          </Text>
        }
      />
      <NumberedSteps
        step={3}
        description={
          <div className={classes.wrap}>
            <Text className={classes.fullRow}>Install the host agent by invoking:</Text>
            <div className={clsx(classes.fullRow, classes.spaceAbove)}>
              <CodeBlock>sudo bash &lt;path to installer&gt;</CodeBlock>
            </div>
          </div>
        }
      />
    </Paper>
  )
}

interface NumberedStepProps {
  step: number
  title?: string
  description: string | JSX.Element
}

const NumberedSteps: FC<NumberedStepProps> = ({
  step,
  title,
  description,
  children,
}): JSX.Element => {
  const classes = useStyles({})
  return (
    <div className={classes.column}>
      {title && <Text variant="subtitle2">{title}</Text>}
      <div className={classes.row}>
        <Text variant="body1" className={classes.step}>
          {step}
        </Text>
        {typeof description === 'string' ? <Text variant="body1">{description}</Text> : description}
        {children}
      </div>
    </div>
  )
}

export default DownloadHostAgentWalkthrough

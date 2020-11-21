import React, { FC, useEffect, useState } from 'react'
import { Paper } from '@material-ui/core'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import { hexToRGBA } from 'core/utils/colorHelpers'
import Button from '@material-ui/core/Button'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import SimpleLink from 'core/components/SimpleLink'
import clsx from 'clsx'
import { getDownloadLinks } from 'openstack/components/hosts/actions'

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
  download: {
    border: `1px solid ${theme.palette.primary.main}`,
    letterSpacing: '1.25px',
    fontWeight: 500,
    color: theme.palette.primary.main,
    background: theme.palette.primary.contrastText,
    padding: theme.spacing(1, 2),
    textTransform: 'uppercase',
  },
  downloadIcon: {
    marginLeft: theme.spacing(1),
  },
  spaceAbove: {
    marginTop: theme.spacing(2),
  },
}))

const DownloadHostAgentWalkthrough = (): JSX.Element => {
  const classes = useStyles({})
  const [downloadLink, setDownloadLink] = useState('')
  useEffect(() => {
    const loadDownloadLink = async () => {
      const links = await getDownloadLinks()
      // In the future when supporting openstack, will want to show all download links
      setDownloadLink(links.rpm_install)
    }
    loadDownloadLink()
  }, [setDownloadLink])

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
            <SimpleLink
              className={clsx(classes.fullRow, classes.spaceAbove)}
              src={downloadLink}
              variant="primary"
            >
              <Button className={classes.download}>
                Download Installer
                <FontAwesomeIcon className={classes.downloadIcon} size="sm" solid>
                  download
                </FontAwesomeIcon>
              </Button>
            </SimpleLink>
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

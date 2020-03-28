import React, { FC } from 'react'
import { Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import { hexToRGBA } from 'core/utils/colorHelpers'
import Button from '@material-ui/core/Button'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import SimpleLink from 'core/components/SimpleLink'
import clsx from 'clsx'

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

  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography variant="h6">
        Adding Platform9 Host Agent
      </Typography>
      <NumberedSteps
        step={1}
        description={
          <div className={classes.wrap}>
            <Typography className={classes.fullRow}>
              Download the host agent installer for your host operating system version:
            </Typography>
            <SimpleLink
              className={clsx(classes.fullRow, classes.spaceAbove)}
              src="/private/platform9-install-us-mpt1-ironic-redhat.sh"
              variant="primary"
              download
            >
              <Button className={classes.download}>
                Download Installer
                <FontAwesomeIcon
                  className={classes.downloadIcon}
                  size="sm"
                  solid>
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
          <Typography>
            Copy the installer to your host operating system, or make it available via a shared folder.
          </Typography>
        }
      />
      <NumberedSteps
        step={3}
        description={
          <div className={classes.wrap}>
            <Typography className={classes.fullRow}>
              Install the host agent by invoking:
            </Typography>
            <div className={clsx(classes.fullRow, classes.spaceAbove)}>
              <CodeBlock>
                sudo bash &lt;path to installer&gt;
              </CodeBlock>
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
      {title && <Typography variant="subtitle2">{title}</Typography>}
      <div className={classes.row}>
        <Typography variant="body1" className={classes.step}>
          {step}
        </Typography>
        {typeof description === 'string' ? (
          <Typography variant="body1">{description}</Typography>
        ) : (
            description
          )}
        {children}
      </div>
    </div>
  )
}

export default DownloadHostAgentWalkthrough

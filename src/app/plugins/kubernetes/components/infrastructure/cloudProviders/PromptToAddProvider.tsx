import React from 'react'
import { CloudProviders } from '../clusters/model'
import { capitalizeString } from 'utils/misc'
import NextButton from 'core/components/buttons/NextButton'
import useReactRouter from 'use-react-router'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>(theme => ({
  message: {
    marginLeft: theme.spacing(),
  }
}))

interface Props {
  type: CloudProviders
  src: string
}

export const PromptToAddProvider = ({ type, src }: Props) => {
  const classes = useStyles({})
  const humanReadableType = capitalizeString(type)
  const { history } = useReactRouter()
  const handleClick = () => {
    history.push(src)
  }
  return (
    <>
      <p className={classes.message}>
        <Typography component="span" variant="body1">To create a cluster with {humanReadableType}, you must first setup a cloud provider. Create at least one before continuing</Typography>
      </p>
      <NextButton onClick={handleClick} showForward={false}>+ Add {humanReadableType} Cloud Provider</NextButton>
    </>
  )
}

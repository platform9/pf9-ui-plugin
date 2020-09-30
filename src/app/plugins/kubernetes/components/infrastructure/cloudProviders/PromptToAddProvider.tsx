import React from 'react'
import { CloudProviders, CloudProvidersFriendlyName } from './model'
import NextButton from 'core/components/buttons/NextButton'
import useReactRouter from 'use-react-router'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import { indefiniteArticle } from 'utils/misc'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  message: {
    marginLeft: theme.spacing(),
  },
}))

interface Props {
  type: CloudProviders
  src: string
}

export const PromptToAddProvider = ({ type, src }: Props) => {
  const classes = useStyles({})
  const humanReadableType = CloudProvidersFriendlyName[type]
  const article = indefiniteArticle(humanReadableType)
  const { history } = useReactRouter()
  const handleClick = () => {
    history.push(src)
  }
  return (
    <>
      <p className={classes.message}>
        <Text component="span" variant="body1">
          To create {article} {humanReadableType} cluster, you must first setup a cloud provider.
          Create at least one before continuing
        </Text>
      </p>
      <NextButton onClick={handleClick} showForward={false}>
        + Add {humanReadableType} Cloud Provider
      </NextButton>
    </>
  )
}

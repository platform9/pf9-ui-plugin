import React from 'react'
import { CloudProviders } from '../clusters/model'
import { capitalizeString } from 'utils/misc'
import NextButton from 'core/components/buttons/NextButton'
import useReactRouter from 'use-react-router'

interface Props {
  type: CloudProviders
  src: string
}
export const PromptToAddProvider = ({ type, src }: Props) => {
  const humanReadableType = capitalizeString(type)
  const { history } = useReactRouter()
  const handleClick = () => {
    history.push(src)
  }
  return (
    <>
      <p>No cloud providers for {humanReadableType} have been created yet. Create at least one before continuing</p>
      <NextButton onClick={handleClick} showForward={false}>+ Add {humanReadableType} Cloud Provider</NextButton>
    </>
  )
}

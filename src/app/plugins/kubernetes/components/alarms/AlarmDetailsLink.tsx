import React, { useState } from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import AlarmDetailsDialog from './AlarmDetailsDialog'
import { IAlertSelector } from './model'

interface Props {
  alarm: IAlertSelector
  display: string
}

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
  },
}))

const AlarmDetailsLink = ({ display, alarm }: Props) => {
  const [dialogOpened, setDialogOpened] = useState(false)
  const { link } = useStyles({})

  return (
    <>
      {dialogOpened && <AlarmDetailsDialog alarm={alarm} onClose={() => setDialogOpened(false)} />}
      <span className={link} onClick={() => setDialogOpened(true)}>
        {display}
      </span>
    </>
  )
}

export default AlarmDetailsLink

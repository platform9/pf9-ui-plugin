import React, { useState } from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import AlarmDetailsDialog from './AlarmDetailsDialog'
import { Alarm } from './model'

interface Props {
  alarm: Alarm
  display: string
}

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    cursor: 'pointer',
  },
}))

const AlarmDetailsLink = ({ display, alarm }: Props) => {
  const [dialogOpened, setDialogOpened] = useState(false)
  const { link } = useStyles({})

  return (
    <>
      { dialogOpened && (
        <AlarmDetailsDialog
          alarm={alarm}
          onClose={() => setDialogOpened(false)}
        />
      )}
      <b className={link} onClick={() => setDialogOpened(true)}>
        {display}
      </b>
    </>
  )
}

export default AlarmDetailsLink

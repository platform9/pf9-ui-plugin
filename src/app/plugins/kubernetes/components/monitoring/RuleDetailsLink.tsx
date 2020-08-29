import React, { useState } from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import RuleDetailsDialog from './RuleDetailsDialog'
import { Alarm } from 'k8s/components/alarms/model'

interface Props {
  rule: Alarm
  display: string
}

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    cursor: 'pointer',
  },
}))

const RuleDetailsLink = ({ display, rule }: Props) => {
  const [dialogOpened, setDialogOpened] = useState(false)
  const { link } = useStyles({})

  return (
    <>
      { dialogOpened && (
        <RuleDetailsDialog
          rule={rule}
          onClose={() => setDialogOpened(false)}
        />
      )}
      <b className={link} onClick={() => setDialogOpened(true)}>
        {display}
      </b>
    </>
  )
}

export default RuleDetailsLink

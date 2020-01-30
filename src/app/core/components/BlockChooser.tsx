import React, { useState, FunctionComponent } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Radio, Typography, Theme } from '@material-ui/core'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    border: '1px solid',
    borderColor: 'rgba(0,0,0,0.87)',
    borderRadius: '4px',
    minWidth: '600px',
  },
  choice: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    maxWidth: '100px',
  },
  text: {
    padding: theme.spacing(0, 2),
    width: '100%',
    textAlign: 'left',
  },
  selected: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#EEE',
  }
}))

interface BlockOption {
  id: string
  title: string
  description: string | JSX.Element
  icon?: JSX.Element
}

interface Props {
  options: BlockOption[]
  onChange?: (id: string) => void
}

// This component presents large format blocks that the user can choose between.
// It is useful for choosing between major options that require a large amount of
// screen real-estate (help text, icons, etc on each option).
const BlockChooser: FunctionComponent<Props> = ({ options = [], onChange }) => {
  const classes = useStyles({})
  const [choice, setChoice] = useState<string>()

  const handleOnChange = (id: string) => () => {
    setChoice(id)
    onChange && onChange(id)
  }

  return (
    <div className={classes.root}>
      {options.map(option => {
        const active = choice === option.id
        return (
          <div className={clsx(classes.choice, active && classes.selected)} key={option.id} onClick={handleOnChange(option.id)}>
            <Radio checked={active} color="primary" />
            <div className={classes.icon}>{option.icon}</div>
            <div className={classes.text}>
              <Typography variant="subtitle1">{option.title}</Typography>
              <Typography variant="body1">{option.description}</Typography>
            </div>
          </div>)
      })}
    </div>
  )
}

export default BlockChooser

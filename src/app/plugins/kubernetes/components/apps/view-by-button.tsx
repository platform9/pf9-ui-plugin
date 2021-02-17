import React from 'react'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles<Theme, Props>((theme) => ({
  centerText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    cursor: 'pointer',
    outline: 0,
    minHeight: 40,
    transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
    padding: theme.spacing(0, 2),
    border: '1px solid transparent',
    backgroundColor: ({ active }) =>
      active ? theme.palette.blue[500] : theme.palette.common.white,
    color: ({ active }) => (active ? theme.palette.grey['000'] : theme.palette.blue[500]),
    borderColor: theme.palette.blue[500],
    borderRadius: 2,
    '&:hover': {
      backgroundColor: theme.palette.blue[300],
      borderColor: theme.palette.blue[300],
      color: theme.palette.grey['000'],
    },
  },
}))

const ViewByButton = (props: Props) => {
  const classes = useStyles(props)
  const handleClick = () => props.onClick(props.value)
  return (
    <Button className={classes.button} onClick={handleClick}>
      <Text className={classes.centerText} component="span" variant="caption1">
        {props.label}
      </Text>
    </Button>
  )
}

interface Props {
  value: string
  active: boolean
  label: string
  onClick: (event) => void
}

export default ViewByButton

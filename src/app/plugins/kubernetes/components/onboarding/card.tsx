import { makeStyles } from '@material-ui/styles'
import React from 'react'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles<Theme, CardProps>((theme) => ({
  card: {
    margin: theme.spacing(2),
    opacity: 1,
    padding: theme.spacing(1.5),
    userSelect: 'none',
    textAlign: 'center',
    display: 'grid',
    gridTemplateRows: '1fr max-content',
    gridTemplateColumns: '1fr',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: 4,
    backgroundColor: theme.palette.grey['000'],
    border: ({ active }) =>
      active ? `1px solid ${theme.palette.blue['500']}` : `1px solid ${theme.palette.grey['700']}`,
    '& img': {
      maxWidth: 160,
      maxHeight: 100,
    },
    '&:hover': {
      border: `1px solid ${theme.palette.blue['500']}`,
    },
  },
  label: {
    color: theme.palette.grey[700],

    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lowerCardContent: {
    textAlign: 'end',
    marginTop: theme.spacing(1),
  },
}))

interface CardProps {
  label: string
  active: boolean
  showTrashIcon?: boolean
  onDelete?: () => void
}

const Card = (props) => {
  const { label, onClick, onDelete, showTrashIcon = true } = props
  const classes = useStyles(props)
  return (
    <div className={classes.card} onClick={onClick}>
      <Text className={classes.label} variant="subtitle2">
        {label}
      </Text>
      <div className={classes.lowerCardContent}>
        {showTrashIcon && <FontAwesomeIcon onClick={onDelete}>trash-alt</FontAwesomeIcon>}
      </div>
    </div>
  )
}

export default Card

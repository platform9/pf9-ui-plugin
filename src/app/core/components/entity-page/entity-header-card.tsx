import React from 'react'
import { makeStyles } from '@material-ui/styles'

import Text from 'core/elements/text'
import ListTableBatchActions from '../listTable/ListTableBatchActions'
import Theme from 'core/themes/model'

interface ActionProps<T> {
  label: string
  icon: string
  dialog?: React.ReactNode
  action?: ([T]) => void
  routeTo?: string
}
export interface EntityHeaderCardProps<T> {
  entity: T
  title: string
  backLink: React.ReactNode
  actions: Array<ActionProps<T>>
}

function EntityHeaderCard<T>({ actions, title, backLink, entity }: EntityHeaderCardProps<T>) {
  const classes = useStyles({})
  return (
    <header className={classes.header}>
      <div className={classes.title}>
        <Text variant="h3" component="h1">
          {title}
        </Text>
        {backLink}
      </div>
      <div className={classes.actionRow}>
        <ListTableBatchActions batchActions={actions} selected={[entity]} />
      </div>
    </header>
  )
}
export default EntityHeaderCard

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    backgroundColor: theme.palette.blue[100],
    border: `1px solid ${theme.palette.blue[500]}`,
    padding: theme.spacing(4, 3, 2.5, 3),
    borderRadius: 4,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    paddingBottom: theme.spacing(2),
  },
  actionRow: {
    paddingTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
}))

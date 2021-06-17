import React from 'react'
import { withStyles } from '@material-ui/styles'
import { DetailRow } from 'k8s/components/infrastructure/nodes/NodeDetailsPage'
import Text from 'core/elements/text'
import clsx from 'clsx'
import { path } from 'ramda'

export interface IDetailFields<T> {
  id: string
  title: string
  required?: boolean
  helpMessage?: string | React.ReactNode
  condition?: (cluster: T) => boolean
  render?: (value: any, item: any) => string | React.ReactNode
}

/**
 * Gets fields for the InfoPanel component
 *
 * Ex. getFieldsForCard(fields, cluster)
 */
export function getFieldsForCard<T>(fields: Array<IDetailFields<T>>, item: T) {
  const fieldsToDisplay = {}
  fields.forEach((field) => {
    const { id, title, required = false, condition, render, helpMessage } = field
    const shouldRender = condition ? condition(item) : true
    const value = path<string | boolean>(id.split('.'), item)
    if (shouldRender && (required || !!value || value === false)) {
      fieldsToDisplay[title] = {
        value: render ? render(value, item) : value,
        helpMessage,
      }
    }
  })
  return fieldsToDisplay
}

const styles = (theme) => ({
  root: {},
  row: {
    width: '100%',
  },
  half: {
    display: 'inline-block',
    width: '50%',
  },
  cardContent: {
    margin: theme.spacing(0, 2, 1),
  },
  card: {
    maxWidth: 607,
    width: 'max-content',
    border: `solid 1px ${theme.palette.grey[300]}`,
    borderRadius: 4,

    '& h3.MuiTypography-subtitle2': {
      color: theme.palette.grey[700],
      padding: theme.spacing(1, 2),
      borderBottom: `solid 1px ${theme.palette.grey[300]}`,
    },
  },
})

interface DetailRowProps {
  classes?: any
  items: any[]
}

// @ts-ignore
const DetailRowDiv = withStyles(styles)(({ classes, items }: DetailRowProps) => {
  return Object.entries(items).map(([name, { value, helpMessage }]) => (
    <DetailRow key={name} label={name} value={value} helpMessage={helpMessage} />
  ))
})

// @ts-ignore
const renderDetailRow = (items) => <DetailRowDiv items={items} />

const InfoPanel = withStyles(styles)(
  ({
    classes,
    items = [],
    customBody = undefined,
    className = undefined,
    title,
  }: InfoPanelProps) => (
    <div className={clsx(classes.card, className)}>
      <Text variant="subtitle2" component="h3">
        {title}
      </Text>
      {customBody && <div className={classes.cardContent}>{customBody}</div>}
      {!customBody && (
        <table className={classes.cardContent}>
          <tbody>
            {Array.isArray(items) ? items.map(renderDetailRow) : renderDetailRow(items)}
          </tbody>
        </table>
      )}
    </div>
  ),
)

interface InfoPanelProps {
  title: string
  classes?: any
  items?: any
  customBody?: JSX.Element | React.ReactNode
  className?: string
}

export default InfoPanel

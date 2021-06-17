import React, { FC } from 'react'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import { Divider } from '@material-ui/core'
import { identity } from 'ramda'
import Theme from 'core/themes/model'
import clsx from 'clsx'

const useStyles = makeStyles<Theme>((theme) => ({
  reviewTable: {
    borderSpacing: '8px',
    tableLayout: 'fixed',
  },
  divider: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  disabledText: {
    color: theme.palette.grey[300],
  },
  rowValue: {
    color: theme.palette.grey[700],
  },
  rowLabel: {
    width: 360,
  },
}))

const DataRow = ({ label, value, renderArray = false, render = identity }) => {
  const classes = useStyles()
  return (
    <tr>
      <td className={classes.rowLabel}>
        <Text variant="body2" component="span">
          {label}
        </Text>
      </td>
      <td>
        <Text
          variant="caption1"
          className={clsx(classes.rowValue, value === 'Not Enabled' && classes.disabledText)}
          component="span"
        >
          {!renderArray && Array.isArray(value)
            ? value.map((val, idx) => (
                <Text key={idx} variant="caption1">
                  {render(val || val === false ? val : '-')}
                </Text>
              ))
            : render(value || value === false ? value : '-')}
        </Text>
      </td>
    </tr>
  )
}

type GenericObject = { [key: string]: string }

interface ReviewRow<T> {
  id: keyof T
  label: string
  render?: (value) => any
  insertDivider?: boolean
  renderArray?: boolean
}

interface Props<T = GenericObject> {
  data: T
  columns: Array<ReviewRow<T>>
}

const FormReviewTable: FC<Props> = ({ data, columns }) => {
  const classes = useStyles()
  const elems: JSX.Element[] = []

  for (const column of columns) {
    const value = data[column.id]
    if (column.insertDivider) {
      // We have a new section, insert a divider
      elems.push(
        <tr key={`${column.id}-divider`}>
          <td colSpan={2}>
            <Divider className={classes.divider} />
          </td>
        </tr>,
      )
    }
    elems.push(<DataRow key={column.id} {...column} value={value} />)
  }

  return (
    <table className={classes.reviewTable}>
      <tbody>{elems}</tbody>
    </table>
  )
}

export default FormReviewTable

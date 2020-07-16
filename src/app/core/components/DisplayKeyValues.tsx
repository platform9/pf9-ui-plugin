import React from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'

interface Props {
  keyValuePairs: KeyValuePair[]
  rowSpacing?: number
}

interface KeyValuePair {
  key: string
  value: string
  render?: any // Having trouble debugging this
}

const useStyles = makeStyles<any, Partial<Props>>((theme: Theme) => ({
  table: {
    borderSpacing: ({ rowSpacing }) => (`0px ${rowSpacing}px`),
    width: '100%',
  },
  td: {
    padding: 0,
    verticalAlign: 'top',
  },
  key: {
    textAlign: 'right',
    whiteSpace: 'nowrap',
    color: theme.palette.grey[700],
  },
  value: {
    paddingLeft: theme.spacing(2.5),
    width: '100%',
  },
}))

const DisplayKeyValues = ({ keyValuePairs, rowSpacing = 12 }: Props) => {
  const classes = useStyles({ rowSpacing })

  const renderPair = (pair) => (
    <tr key={pair.key}>
      <td className={clsx(classes.td, classes.key)}>{pair.key}:</td>
      { pair.render ? (
        <td className={clsx(classes.td, classes.value)}>
          { pair.render(pair.value) }
        </td>
      ) : (
        <td className={clsx(classes.td, classes.value)}>{pair.value}</td>
      )}
    </tr>
  )

  return (
    <table className={classes.table}>
      <tbody>
        { keyValuePairs.map((pair) => renderPair(pair)) }
      </tbody>
    </table>
  )
}

export default DisplayKeyValues

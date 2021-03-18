import React from 'react'
import Text from 'core/elements/text'
import { toPairs } from 'ramda'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
  labelsContainer: {
    display: 'grid',
    gridTemplateRows: 'max-content',
    gridGap: 4,
  },
  label: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gridGap: theme.spacing(2),
    '& > span': {
      justifySelf: 'flex-start',
      margin: 0,
    },
    '& b': {
      fontWeight: 600,
    },
  },
  value: {
    display: 'block',
    wordBreak: 'break-all',
  },
}))

export const RenderLabels = ({
  variant = 'body2',
  labels,
  keyOverrides = undefined,
  inverse = false,
  split = false,
}) => {
  const classes = useStyles({ split, inverse })
  return (
    <div className={classes.labelsContainer}>
      {toPairs(labels).map(([name, value]) => {
        const labelValue = Array.isArray(value) ? value.length : value
        // eslint-disable-next-line no-extra-boolean-cast
        const formattedName = !!keyOverrides ? keyOverrides[name] : name
        return (
          <div className={classes.label} key={name}>
            {inverse ? (
              <Text component="span" variant={variant}>
                {formattedName}:
              </Text>
            ) : (
              <Text component="span" variant={variant}>
                <b>{formattedName}:</b>
              </Text>
            )}
            {inverse ? (
              <Text component="span" variant={variant} className={classes.value}>
                <b>{labelValue}</b>
              </Text>
            ) : (
              <Text component="span" variant={variant} className={classes.value}>
                {labelValue}
              </Text>
            )}
          </div>
        )
      })}
    </div>
  )
}

const renderLabels = (type, variant) => (labels) => (
  <RenderLabels variant={variant} labels={labels} />
)

export default renderLabels

import React from 'react'
import Text from 'core/elements/text'
import { toPairs } from 'ramda'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme) => ({
  label: {
    '& > span': {
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: ({ split }) => (split ? 'space-between' : 'flex-start'),

      '& b': {
        fontWeight: 600,
        whiteSpace: 'nowrap',
        margin: ({ inverse }) => (inverse ? '0 0 0 8px' : '0 8px 0 0'),
      },
    },
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
    <React.Fragment>
      {toPairs(labels).map(([name, value]) => {
        const labelValue = Array.isArray(value) ? value.length : value
        // eslint-disable-next-line no-extra-boolean-cast
        const formattedName = !!keyOverrides ? keyOverrides[name] : name
        return (
          <Text key={name} variant={variant} className={classes.label} component="p">
            {inverse && (
              <span>
                {formattedName}: <b>{labelValue}</b>
              </span>
            )}
            {!inverse && (
              <span>
                <b>{formattedName}:</b> {labelValue}
              </span>
            )}
          </Text>
        )
      })}
    </React.Fragment>
  )
}

const renderLabels = (type, variant) => (labels) => (
  <RenderLabels variant={variant} labels={labels} />
)

export default renderLabels

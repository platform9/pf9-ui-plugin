import React from 'react'
import PieGraph, { PieDataEntry } from 'core/components/graphs/PieGraph'
import { makeStyles } from '@material-ui/styles'
import { useTheme } from '@material-ui/core/styles'
import Text from 'core/elements/text'
import { pathStr } from 'utils/fp'
import { formattedName } from 'core/utils/formatters'
import Theme from 'core/themes/model'
import { Tooltip } from '@material-ui/core'

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  pieLegend: {
    display: 'grid',
    gridTemplateRows: 'repeat(auto-fill, 20px)',
    gridGap: theme.spacing(),
    alignContent: 'center',
    justifyItems: 'start',
  },
  legendName: {
    color: '#1c2c79', // theme.palette.grey[800], why is this color in the design?
    whiteSpace: 'nowrap',
  },
  legendCount: {
    justifySelf: 'end', // for when there are large and small counts
    color: theme.palette.grey['000'],
    padding: '0px 5px 2px',
    borderRadius: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
    minWidth: 10,
  },
  legendRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(min-content, 36px) 1fr',
    gridGap: theme.spacing(),
  },
}))

export interface PieUsageWidgetProps {
  primary: string
  sideLength: number
  arcWidth: number
  data: PieDataEntry[]
}

export const PieLegend = ({ data }) => {
  const theme: any = useTheme()
  const classes = useStyles({})
  const { pieLegend, legendName } = useStyles({})

  return (
    <legend className={pieLegend}>
      {data &&
        data.map((entry) => (
          <div key={entry.name} className={classes.legendRow}>
            <Text
              component="span"
              variant="caption1"
              className={classes.legendCount}
              style={{ backgroundColor: pathStr(entry.color, theme.palette) }}
            >
              {entry.value}
            </Text>
            {entry.info ? (
              <Tooltip title={entry.info}>
                <Text component="span" variant="body2" className={legendName}>
                  {formattedName(entry.name)}
                </Text>
              </Tooltip>
            ) : (
              <Text component="span" variant="body2" className={legendName}>
                {formattedName(entry.name)}
              </Text>
            )}
          </div>
        ))}
    </legend>
  )
}

const PieUsageWidget = ({
  primary,
  data,
  sideLength = 110,
  arcWidth = 12,
  ...rest
}: PieUsageWidgetProps) => {
  const { container } = useStyles({})

  const total = data.reduce((acc, cur) => acc + cur.value, 0)
  const primaryObj = data.find((x) => x.name === primary)
  const primaryNum = primaryObj.value
  const percent = primaryNum / total || 0
  const healthColorKey =
    percent < 0.25 ? 'red' : percent < 0.5 ? 'orange' : percent < 0.75 ? 'yellow' : 'green'

  return (
    <div className={container}>
      <PieGraph
        sideLength={sideLength}
        arcWidth={arcWidth}
        data={data}
        percent={percent}
        healthColor={healthColorKey}
        primary={primary}
        empty={!total}
        {...rest}
      />
      <PieLegend data={data} />
    </div>
  )
}

export default PieUsageWidget

import React from 'react'
import PieGraph, { PieDataEntry } from 'core/components/graphs/PieGraph'
import { makeStyles } from '@material-ui/styles'
import { useTheme } from '@material-ui/core/styles'
import Text from 'core/elements/text'
import { pathStr } from 'utils/fp'
import { formattedName } from 'core/utils/formatters'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  pieLegend: {
    display: 'grid',
    gridTemplateRows: 'repeat(auto-fill, 20px)',
    gridTemplateColumns: 'minmax(min-content, 20px) 1fr',
    gridGap: theme.spacing(),
    marginLeft: theme.spacing(2),
    alignContent: 'center',
    justifyItems: 'start',
  },
  legendName: {
    color: '#1c2c79', // theme.palette.grey[800], why is this color in the design?
    whiteSpace: 'nowrap',
  },
  legendCount: {
    justifySelf: 'center', // for when there are large and small counts
    color: theme.palette.grey['000'],
    padding: '0px 5px 2px',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
    minWidth: 10,
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
          <React.Fragment key={entry.name}>
            <Text
              variant="caption1"
              className={classes.legendCount}
              style={{ backgroundColor: pathStr(entry.color, theme.palette) }}
            >
              {entry.value}
            </Text>
            <Text variant="body2" className={legendName}>
              {formattedName(entry.name)}
            </Text>
          </React.Fragment>
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

  return (
    <div className={container}>
      <PieGraph
        sideLength={sideLength}
        arcWidth={arcWidth}
        data={data}
        percent={percent}
        primary={primary}
        empty={!total}
        {...rest}
      />
      <PieLegend data={data} />
    </div>
  )
}

export default PieUsageWidget

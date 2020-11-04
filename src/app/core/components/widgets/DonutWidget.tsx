import React from 'react'
import { PieUsageWidgetProps, PieLegend } from './PieUsageWidget'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import PieGraph from '../graphs/PieGraph'

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
}))

const PieUsageWidget = ({
  data,
  sideLength = 110,
  arcWidth = 12,
  ...rest
}: PieUsageWidgetProps) => {
  const { container } = useStyles({})

  return (
    <div className={container}>
      <PieGraph sideLength={sideLength} arcWidth={arcWidth} data={data} empty={!data} />
      <PieLegend data={data} />
    </div>
  )
}

export default PieUsageWidget

import React from 'react'
import WidgetCard from 'core/components/widgets/WidgetCard'
import SquaresGraph from 'core/components/graphs/SquaresGraph'

const NetworksWidget = ({ numNetworks }) => {
  return (
    <WidgetCard title={'Networks'} headerImg={'/ui/images/icon-network.svg'}>
      <SquaresGraph num={numNetworks} label={`${numNetworks} Active Networks`} />
    </WidgetCard>
  )
}

export default NetworksWidget

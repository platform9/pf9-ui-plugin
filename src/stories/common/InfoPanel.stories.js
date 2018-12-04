import React from 'react'
import { addStories } from '../helpers'
import InfoPanel from 'core/common/InfoPanel'

const items = {
  IP: '127.0.0.1',
  hostname: 'localhost',
  enabled: true,
  quantity: 5,
}
addStories('Common Components/InfoPanel', {
  'w/ some data': () => (
    <InfoPanel title="Details" items={items} />
  )
})

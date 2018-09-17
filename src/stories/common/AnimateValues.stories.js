import React from 'react'
import { addStories } from '../helpers'

import AnimateValues from 'core/common/AnimateValues'

const calcStyle = ({ width }) => ({
  width: `${width}px`,
  height: '100px',
  border: '1px solid #000',
  backgroundColor: '#fcc',
})

addStories('Common Components/AnimateValues', {
  'Animate a bar': () => (
    <AnimateValues values={{ width: [0, 500] }} duration={3000}>
      {values => (
        <div style={calcStyle(values)}>
          <pre>{JSON.stringify(values, null, 4)}</pre>
        </div>
      )}
    </AnimateValues>
  ),
})

import React from 'react'

// Simple component that is useful to see what props are being sent to a component
const DebugProps = React.forwardRef((props, ref) => <pre ref={ref}>{JSON.stringify(props, null, 4)}</pre>)

export default DebugProps

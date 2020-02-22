import React from 'react'
import PushEventManager from 'core/PushEventManager'

class PushEventsProvider extends React.Component<{}, {}> {
  unsubscribe : () => void

  handleMessage = (message: Object) => {
    console.log(message)
  }

  componentDidMount () {
    this.unsubscribe = PushEventManager.getInstance().connect().subscribe(this.handleMessage)
  }

  componentWillUnmount () {
    this.unsubscribe()
  }
  
  render = () => this.props.children
}

export default PushEventsProvider

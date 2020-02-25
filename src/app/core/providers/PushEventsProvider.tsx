import React from 'react'
import PushEventManager from 'core/PushEventManager'

interface IMessage {
  source: string
  type: string
  payload: any
}

class PushEventsProvider extends React.Component<{}, {}> {
  unsubscribe: () => void

  // All this will probably change once we switch to a redux architecture
  // but I am keeping all event handling inside this component for now
  // so that the event handlers have access to the data store and to
  // display toast notifications.

  handleClusterNode = (payload) => {
    // console.log('qbert::cluster_node', payload)
  }

  handleClusterUpdate = (payload) => {
    // console.log('qbert::cluster_update', payload)
  }

  handleClusterStatus = (payload) => {
    const { action } = payload
    const actionHandlers = {
      create: this.handleClusterStatusCreate(payload),
      delete: this.handleClusterStatusDelete(payload),
    }
    const catchAll = (payload) => {
      console.info(`No push event handler found for qbert::cluster_status with action: ${action}`)
    }
    const handler = actionHandlers[action] || catchAll
    handler(payload)
  }

  handleClusterStatusCreate = (payload) => {
    const clusterUuid = payload.source
    console.log(`Cluster created with uuid: ${clusterUuid}`)
    // TODO update the data store
  }

  handleClusterStatusDelete = (payload) => {
    const clusterUuid = payload.source
    console.log(`Cluster deleted with uuid: ${clusterUuid}`)
    // TODO update the data store
  }

  handleMessage = (message: IMessage) => {
    const { source, type, payload } = message

    const handlers = {
      qbert: {
        cluster_node: this.handleClusterNode,
        cluster_update: this.handleClusterUpdate,
        cluster_status: this.handleClusterStatus,
      },
    }

    const sourceHandler = handlers[source]
    if (!sourceHandler) {
      return console.error(`No push event handlers implemented for source ${source}`)
    }

    const typeHandler = sourceHandler[type]
    if (!typeHandler) {
      return console.error(`No push event handlers implemented for source ${source} type ${type}`)
    }

    typeHandler(payload)
  }

  componentDidMount = () => {
    const pushInstance = PushEventManager.getInstance()
    pushInstance.connect()
    const unsub = pushInstance.subscribe(this.handleMessage)
    this.unsubscribe = unsub
  }

  componentWillUnmount = () => {
    this.unsubscribe()
  }

  render = () => this.props.children
}

export default PushEventsProvider

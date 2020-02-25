import React, { FC, useEffect } from 'react'
import PushEventManager from 'core/PushEventManager'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'

interface IMessage {
  source: string
  type: string
  payload: any
}

interface Props {
  children: any
}

const PushEventsProvider: FC<Props> = ({ children }) => {
  // All this will probably change once we switch to a redux architecture
  // but I am keeping all event handling inside this component for now
  // so that the event handlers have access to the data store and to
  // display toast notifications.

  const [, , reloadClusters] = useDataLoader(clusterActions.list, {}, { loadOnDemand: true })

  const handleClusterNode = (payload) => {
    // console.log('qbert::cluster_node', payload)
  }

  const handleClusterUpdate = (payload) => {
    // console.log('qbert::cluster_update', payload)
  }

  const handleClusterStatus = (payload) => {
    const { action } = payload
    const actionHandlers = {
      create: handleClusterStatusCreate(payload),
      delete: handleClusterStatusDelete(payload),
    }
    const catchAll = (payload) => {
      console.info(`No push event handler found for qbert::cluster_status with action: ${action}`)
    }
    const handler = actionHandlers[action] || catchAll
    handler(payload)
  }

  const handleClusterStatusCreate = (payload) => {
    const clusterUuid = payload[0].source
    console.log(`Cluster created with uuid: ${clusterUuid}`)
    reloadClusters(true)
  }

  const handleClusterStatusDelete = (payload) => {
    const clusterUuid = payload.source
    console.log(`Cluster deleted with uuid: ${clusterUuid}`)
    reloadClusters(true)
  }

  const handleMessage = (message: IMessage) => {
    const { source, type, payload } = message

    const handlers = {
      qbert: {
        cluster_node: handleClusterNode,
        cluster_update: handleClusterUpdate,
        cluster_status: handleClusterStatus,
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
  useEffect(() => {
    const pushInstance = PushEventManager.getInstance()
    pushInstance.connect()
    const unsub = pushInstance.subscribe(handleMessage)
    return () => {
      unsub()
    }
  }, [])
  return <>{children}</>
}

export default PushEventsProvider

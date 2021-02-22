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

  const handleClusterStatus = (items) => {
    items.forEach((item) => {
      const { action } = item
      const actionHandlers = {
        create: handleClusterStatusCreate,
        delete: handleClusterStatusDelete,
      }
      const catchAll = (_item) => {
        console.warn(
          `No push event handler found for qbert::cluster_status with action: ${_item?.action}`,
          _item,
        )
      }
      const handler = actionHandlers[action] || catchAll
      handler(item)
    })
  }

  const handleClusterStatusCreate = (payload) => {
    const clusterUuid = payload?.source?.clusterUuid
    console.info(`Cluster created with uuid: ${clusterUuid}`)
    reloadClusters(true)
  }

  const handleClusterStatusDelete = (payload) => {
    const clusterUuid = payload?.source?.clusterUuid
    console.info(`Cluster deleted with uuid: ${clusterUuid}`)
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
      return console.warn(`No push event handlers implemented for source ${source}`)
    }

    const typeHandler = sourceHandler[type]
    if (!typeHandler) {
      return console.warn(`No push event handlers implemented for source ${source} type ${type}`)
    }

    typeHandler(payload)
  }

  useEffect(() => {
    const pushInstance = PushEventManager.getInstance()
    // TODO re-enable socket connection when the backend starts sending us data
    // pushInstance.connect()
    const unsub = pushInstance.subscribe(handleMessage)
    return () => {
      unsub()
    }
  }, [])
  return <>{children}</>
}

export default PushEventsProvider

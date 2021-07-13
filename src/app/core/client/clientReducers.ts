import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DDUHealth } from 'api-client/model'
import { assocPath, mergeLeft } from 'ramda'

interface SystemStatus {
  taskState: DDUHealth['task_state']
  desiredServices: DDUHealth['desired_services']
  readyServices: DDUHealth['ready_services']
  serviceDetails: DDUHealth['service_details']
}

export interface ClientState {
  endpoints: { [key: string]: string }
  systemStatus: SystemStatus
}
export const initialState: ClientState = {
  endpoints: {},
  systemStatus: {
    taskState: 'unknown',
    desiredServices: 0,
    readyServices: 0,
    serviceDetails: {},
  },
}

const { name: clientStoreKey, reducer: clientReducers, actions: clientActions } = createSlice({
  name: 'client',
  initialState,
  reducers: {
    initClient: (state, { payload }: PayloadAction<Partial<ClientState>>) => {
      return mergeLeft(payload, initialState)
    },
    setSystemStatus: (state, { payload }: PayloadAction<DDUHealth>) => {
      return {
        ...state,
        systemStatus: {
          taskState: payload.task_state,
          desiredServices: payload.desired_services,
          readyServices: payload.ready_services,
          serviceDetails: payload.service_details,
        },
      }
    },
    setEndpoint: (state, { payload }: PayloadAction<{ clientKey: string; value: string }>) => {
      return assocPath(['endpoints', payload.clientKey], payload.value, state)
    },
    updateClient: (state, { payload }: PayloadAction<Partial<ClientState>>) => {
      return mergeLeft(payload, state)
    },
    destroyClient: () => {
      return initialState
    },
  },
})

export { clientStoreKey, clientActions }
export default clientReducers

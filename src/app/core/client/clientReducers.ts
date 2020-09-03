import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { assocPath, mergeLeft } from 'ramda'

export interface ClientState {
  endpoints: { [key: string]: string }
}

export const initialState: ClientState = {
  endpoints: {},
}

const { name: clientStoreKey, reducer: clientReducers, actions: clientActions } = createSlice({
  name: 'client',
  initialState,
  reducers: {
    initClient: (state, { payload }: PayloadAction<Partial<ClientState>>) => {
      return mergeLeft(payload, initialState)
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

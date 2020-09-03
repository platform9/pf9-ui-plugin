import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { pipe, take, prepend } from 'ramda'
import moment from 'moment'
import uuid from 'uuid'

const maxNotifications = 30

export enum NotificationType {
  warning = 'warning',
  error = 'error',
  info = 'info',
}

export interface Notification {
  id: string
  title: string
  message: string
  date: string
  type: NotificationType
}

export type NotificationState = Notification[]

export const initialState: Notification[] = []

const {
  name: notificationStoreKey,
  reducer: notificationReducers,
  actions: notificationActions,
} = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    registerNotification: (
      state,
      {
        payload: { title, message, type },
      }: PayloadAction<{ title: string; message: string; type: NotificationType }>,
    ) => {
      return pipe<Notification[], Notification[], Notification[]>(
        take(maxNotifications - 1),
        prepend({
          id: uuid.v4(),
          title,
          message,
          date: moment().format(),
          type,
        }),
      )(state)
    },
    clearNotifications: () => {
      return initialState
    },
  },
})

export { notificationStoreKey, notificationActions }
export default notificationReducers

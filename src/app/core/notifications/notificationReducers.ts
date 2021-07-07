import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { pipe, prepend, take } from 'ramda'
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
  silent: boolean
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

export const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
}

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
        payload: { title, message, type, silent = false },
      }: PayloadAction<{
        title: string
        message: string
        type: NotificationType
        silent?: boolean
      }>,
    ) => {
      console.count('notificationReducers/registerNotification')
      const { notifications, unreadCount } = state
      const addNotification = pipe<Notification[], Notification[], Notification[]>(
        take(maxNotifications - 1),
        prepend({
          id: uuid.v4(),
          title,
          message,
          date: moment().format(),
          type,
          silent,
        }),
      )
      return {
        notifications: addNotification(notifications),
        unreadCount: unreadCount + 1,
      }
    },
    markAsRead: (state) => {
      console.count('notificationReducers/markAsRead')
      return {
        ...state,
        unreadCount: 0,
      }
    },
    clearNotifications: () => {
      console.count('notificationReducers/clearNotifications')
      return initialState
    },
  },
})

export { notificationStoreKey, notificationActions }
export default notificationReducers

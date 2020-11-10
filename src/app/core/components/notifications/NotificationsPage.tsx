import { useDispatch, useSelector } from 'react-redux'
import {
  notificationActions,
  NotificationState,
  notificationStoreKey,
} from 'core/notifications/notificationReducers'
import { prop } from 'ramda'
import Text from 'core/elements/text'
import ListTable from 'core/components/listTable/ListTable'
import React, { useCallback, useEffect } from 'react'
import moment from 'moment'
import Button from 'core/elements/button'

const columns = [
  { id: 'title', label: 'Title' },
  { id: 'message', label: 'Message' },
  { id: 'type', label: 'Type' },
  {
    id: 'date',
    label: 'Date',
    render: (value) => moment(value).format('LLL'),
    sortWith: (prevDate, nextDate) => (moment(prevDate).isBefore(nextDate) ? 1 : -1),
  },
]

const NotificationsPage = () => {
  const { notifications } = useSelector(prop<string, NotificationState>(notificationStoreKey))
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(notificationActions.markAsRead())
  }, [])

  const clearNotifications = useCallback(() => {
    dispatch(notificationActions.clearNotifications())
  }, [])

  return (
    <div>
      <Text variant="body1" component="div">
        Notifications list
      </Text>
      <ListTable
        showCheckboxes={false}
        compactTable
        multiSelection
        columns={columns}
        data={notifications}
      />
      <br />
      <Button onClick={clearNotifications} color="primary">
        Clear Notifications
      </Button>
    </div>
  )
}

export default NotificationsPage

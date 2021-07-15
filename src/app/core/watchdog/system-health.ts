import ApiClient from 'api-client/ApiClient'
import {
  summaryMessages,
  isSystemHealthy,
} from 'app/plugins/account/components/system-status/helpers'
import { clientActions } from 'core/client/clientReducers'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'

const client = ApiClient.getInstance()

const systemHealthCheck = async (dispatch) => {
  const data = await client.getSystemHealth()
  if (!isSystemHealthy(data.task_state, data.service_details)) {
    dispatch(
      notificationActions.registerNotification({
        title: 'System error',
        message: summaryMessages[data.task_state],
        type: NotificationType.error,
      }),
    )
  }
  dispatch(clientActions.setSystemStatus(data))
}
export default systemHealthCheck

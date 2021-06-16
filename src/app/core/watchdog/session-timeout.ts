import { MessageTypes } from 'core/components/notifications/model'
import { sessionActions } from 'core/session/sessionReducers'
import moment from 'moment'

const sessionTimeoutCheck = (session, showToast) => (dispatch) => {
  // Check if session has expired
  const { expiresAt } = session
  const sessionExpired = moment().isAfter(expiresAt)
  if (sessionExpired) {
    dispatch(sessionActions.destroySession())
    showToast('The session has expired, please log in again', MessageTypes.warning)
  }
}
export default sessionTimeoutCheck

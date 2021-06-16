import { isNumeric } from 'utils/misc'

export enum TaskStates {
  Ready = 'ready',
  Error = 'error',
  Suspended = 'suspended',
  Resuming = 'resuming',
  ResumeError = 'resume_error',
  SuspendError = 'suspend_error',
}

// ;(status: IClusterStatus, theme: Theme) =>
//   ({
//     ok: theme.palette.green.main,
//     pause: theme.palette.yellow.main,
//     fail: theme.palette.red.main,
//     error: theme.palette.red.main,
//     loading: theme.palette.blue.main,
//     unknown: theme.palette.grey.main,
//     upgrade: theme.palette.orange.main,
//   }[status] || theme.palette.red.main)

export const convertTaskStateToStatus = (taskState) =>
  ({
    [TaskStates.Ready]: 'ok',
    [TaskStates.Error]: 'error',
    [TaskStates.Suspended]: 'loading',
    [TaskStates.Resuming]: 'loading',
    [TaskStates.ResumeError]: 'error',
    [TaskStates.SuspendError]: 'error',
  }[taskState] || 'unknown')

export const isSystemHealthy = (taskState, serviceDetails) => {
  if ([TaskStates.Error, TaskStates.ResumeError, TaskStates.SuspendError].includes(taskState)) {
    return false
  }
  for (const service of serviceDetails) {
    if (service.ready < service.desired) {
      return false
    }
  }
  return true
}

export const isServiceHealthy = ({ desired, ready }) => desired === ready

export const isSystemResuming = (state) => ['suspended', 'resuming'].includes(state)

export const getServiceMessage = (desired, ready) => {
  if (!isNumeric(desired) || !isNumeric(ready)) {
    return ''
  }
  if (desired === ready) {
    return `all ${desired} services are running`
  } else if (ready === 0) {
    return `none of the ${desired} services are running`
  }
  return `only ${ready} of the ${desired} services are running`
}

export const summaryMessages = {
  [TaskStates.Ready]: 'Your Management Plane Is Operational',
  [TaskStates.Error]: 'Your Management Plane Is In A Failed State',
  [TaskStates.Suspended]: 'Your Management Plane Has Been Suspended',
  [TaskStates.Resuming]: 'Your Management Plane Is Resuming',
  [TaskStates.ResumeError]: 'Your Management Plane Is In A Failed State',
  [TaskStates.SuspendError]: 'Your Management Plane Is In A Failed State',
}
export const detailMessages = {
  [TaskStates.Ready]: 'The Platform9 SaaS Managment Plane is active and operational',
  [TaskStates.Error]:
    'A fatal error has occured, please contract your Platform9 administrator for help',
  [TaskStates.Suspended]:
    'The Platform9 SaaS Managment Plane was suspended and is in the process of resuming',
  [TaskStates.Resuming]:
    'The Platform9 SaaS Managment Plane was suspended and is in the process of resuming',
  [TaskStates.ResumeError]:
    'A fatal error has occured while resuming the Platform9 SaaS Managment Plane, please contract your Platform9 administrator for help',
  [TaskStates.SuspendError]:
    'A fatal error has occured while suspending the Platform9 SaaS Managment Plane, please contract your Platform9 administrator for help',
}

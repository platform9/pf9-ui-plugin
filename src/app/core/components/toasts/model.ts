
export enum MessageTypes {
  success = 'success',
  warning = 'warning',
  error = 'error',
  info = 'info'
}

export interface MessageOptions {
  id: string
  text: string
  variant: MessageTypes
  isOpen: boolean
  onClose: () => void
}
import VirtualMachineDeleteDialog from './delete-vm-dialog'
import PowerVirtualMachineDialog from './power-vm-dialog'

export const batchActions = [
  {
    icon: 'power-off',
    label: 'Power',
    cond: () => false,
    disabledInfo: () => 'Coming Soon.',
    dialog: PowerVirtualMachineDialog,
  },
  {
    icon: 'terminal',
    label: 'Console',
    dialog: null,
    cond: () => false,
    disabledInfo: () => 'Coming Soon.',
  },
  {
    icon: 'chart-bar',
    label: 'Monitoring',
    dialog: null,
    cond: () => false,
    disabledInfo: () => 'Coming Soon.',
  },
  {
    icon: 'suitcase',
    label: 'Migrate',
    dialog: null,
    cond: () => false,
    disabledInfo: () => 'Coming Soon.',
  },
  {
    icon: 'edit',
    label: 'Edit',
    dialog: null,
    cond: () => false,
    disabledInfo: () => 'Coming Soon.',
  },
  {
    icon: 'trash-alt',
    label: 'Delete',
    dialog: VirtualMachineDeleteDialog,
  },
]

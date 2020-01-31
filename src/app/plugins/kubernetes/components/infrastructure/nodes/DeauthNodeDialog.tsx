import React, { useState } from 'react'
import {
  Typography,
  DialogActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import { deAuthNode } from 'k8s/components/infrastructure/nodes/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ListTable from 'core/components/listTable/ListTable'
import { ICombinedNode } from './model'

interface IDeauthNodeDialogProps {
  nodeList: ICombinedNode[]
  onClose: () => void
}

interface IDeauthNode {
  uuid: string
  name: string
  primaryIp: string
  role: string
}

type IHandleOnSelectAll = (selectedNode: IDeauthNode[], isSelected: boolean) => void
type IHandleDeauthNodeSelection = (selectedNode: IDeauthNode, isSelected) => void
type IGetNodeList = (nodeList: any[]) => IDeauthNode[]

const column = [
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'primaryIp', label: 'IP' },
  { id: 'role', label: 'Role' },
]
const stopPropagation = (e) => e.stopPropagation()
const getNodeList: IGetNodeList = (nodeList) =>
  nodeList.map(({ uuid, status, primaryIp, name, isMaster }) => {
    const healthStatus =
      status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
    const role = isMaster ? 'Master' : 'Worker'
    return { uuid, name, status: healthStatus, primaryIp, role }
  })

const DeauthNodeDialog: React.FunctionComponent<IDeauthNodeDialogProps> = ({
  nodeList,
  onClose,
}) => {
  const [selectedNodeList, setSelectedNodeList] = useState([])
  const [deAuthNodeList, deAuthingNode] = useDataUpdater(deAuthNode, onClose)
  const handleDelete = async () => {
    // TODO: Need to handle the error case depending on rest API
    await Promise.all(selectedNodeList.map((node) => deAuthNodeList(node)))
  }
  const nodeData: IDeauthNode[] = getNodeList(nodeList)
  const handleDeauthNodeSelection: IHandleDeauthNodeSelection = (selectedNode, isSelected) => {
    if (isSelected) {
      setSelectedNodeList(selectedNodeList.filter((node) => node.uuid !== selectedNode.uuid))
    } else {
      setSelectedNodeList(selectedNodeList.concat([selectedNode]))
    }
  }

  const handleOnSelectAll: IHandleOnSelectAll = (selectedNodes, selected) => {
    selected ? setSelectedNodeList(selectedNodes) : setSelectedNodeList([])
  }

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <DialogTitle>Deauthorise nodes?</DialogTitle>
      <Progress loading={deAuthingNode} renderContentOnMount maxHeight={60}>
        <DialogContent>
          <Typography variant="body1" component="div">
            Please select the node from to list to de-authorise.
          </Typography>
          <ListTable
            compactTable
            multiSelection
            columns={column}
            data={nodeData}
            selectedRows={selectedNodeList}
            onSelect={handleDeauthNodeSelection}
            onSelectAll={handleOnSelectAll}
          />
        </DialogContent>
      </Progress>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Cancel
        </Button>
        {selectedNodeList.length > 0 && (
          <Button type="submit" variant="contained" color="primary" onClick={handleDelete}>
            Confirm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default DeauthNodeDialog

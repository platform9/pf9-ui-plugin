import React, { useCallback, useState } from 'react'
import { pluck } from 'ramda'
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

const column = [
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'primaryIp', label: 'IP' },
  { id: 'role', label: 'Role' },
]

const getNodeId = pluck('id')
const stopPropagation = (e) => e.stopPropagation()
const getNodeList = (nodeList) =>
  nodeList.map(({ uuid, status, primaryIp, name, isMaster }) => {
    const healthStatus =
      status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
    const role = isMaster ? 'Master' : 'Worker'
    return { id: uuid, name, status: healthStatus, primaryIp, role }
  })

const DeauthNodeDialog: React.FunctionComponent<IDeauthNodeDialogProps> = ({
  nodeList,
  onClose,
}) => {
  const [selectedNodeList, setSelectedNodeList] = useState([])
  const [deAuthNodeList, deAuthingNode] = useDataUpdater(deAuthNode, onClose)
  const handleDelete = useCallback(async () => {
    await deAuthNodeList(getNodeId(selectedNodeList))
  }, [nodeList])
  const nodeData = getNodeList(nodeList)
  const handleDeauthNodeSelection = (node, isSelected: boolean) => {
    const selectedIndex: number = nodeData.indexOf(node)
    if (isSelected) {
      setSelectedNodeList(selectedNodeList.filter((n) => n.id !== node.id))
    } else {
      setSelectedNodeList(
        [].concat(nodeData.slice(0, selectedIndex), nodeData.slice(selectedIndex + 1)),
      )
    }
  }

  const handleOnSelectAll = (selectedNodes, selected) => {
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

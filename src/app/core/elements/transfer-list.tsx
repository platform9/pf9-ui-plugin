import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import SearchBar from 'core/components/SearchBar'
import Text from './text'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 'auto',
  },
  search: {
    marginBottom: '10px !important',
  },
  paper: {
    width: 300,
    height: 260,
    overflow: 'auto',
    boxShadow: 'none',
    borderTop: '1px solid #000',
    borderRadius: '0px',
  },
  button: {
    margin: theme.spacing(0.5, 0),
    fontSize: '22px',
  },
  listItem: {
    borderBottom: '1px solid #ddd',
  },
  text: {
    marginBottom: theme.spacing(1),
  },
  list: {
    justifyContent: 'space-between',
  },
}))

function comparer(otherArray) {
  return function(current) {
    return (
      otherArray.filter(function(other) {
        return other.name === current.name
      }).length === 0
    )
  }
}

function intersection(a, b) {
  return a.filter((value) => b.includes(value))
}

function uniqueList(list) {
  let unique = []
  unique = Object.values(
    list.reduce((acc, item) => {
      acc[item.uuid] = item
      return acc
    }, {}),
  )
  return unique
}

let leftClusterNodes = []
let rightClusterNodes = []
export default function TransferList({ clusterNodes, setWizardContext, wizardContext }) {
  const classes = useStyles()
  const [checked, setChecked] = React.useState([])
  const [searchLeft, setSearchLeft] = React.useState('')
  const [searchRight, setSearchRight] = React.useState('')
  const [left, setLeft] = React.useState(clusterNodes)
  const [right, setRight] = React.useState([])

  const leftChecked = intersection(checked, left)
  const rightChecked = intersection(checked, right)
  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value)
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setChecked(newChecked)
  }

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked))
    setLeft(left.filter(comparer(leftChecked)))
    setChecked([])
  }

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked))
    setRight(right.filter(comparer(rightChecked)))
    setChecked([])
  }

  const customList = (items, listName) => (
    <Paper className={classes.paper}>
      <List dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${listName}-${value.uuid}-label`

          return (
            <ListItem
              className={classes.listItem}
              key={value.uuid}
              role="listitem"
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  color={'primary'}
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${value.name}`} />
            </ListItem>
          )
        })}
        <ListItem />
      </List>
    </Paper>
  )

  useEffect(() => {
    if (!searchRight) {
      rightClusterNodes = []
      rightClusterNodes = uniqueList(rightClusterNodes.concat(right))
    }
    if (!searchLeft) {
      leftClusterNodes = []
      leftClusterNodes = uniqueList(leftClusterNodes.concat(left))
    }

    setWizardContext({ batchUpgradeNodes: right })
  }, [right, left])

  useEffect(() => {
    setLeft(
      leftClusterNodes.filter((value) =>
        value.name.toLowerCase().includes(searchLeft.toLowerCase()),
      ),
    )
  }, [searchLeft])

  useEffect(() => {
    setRight(
      rightClusterNodes.filter((value) =>
        value.name.toLowerCase().includes(searchRight.toLowerCase()),
      ),
    )
  }, [searchRight])

  const handleLeftSearchChange = (search) => setSearchLeft(search)

  const handleRightSearchChange = (search) => setSearchRight(search)

  return (
    <Grid container justify="space-between" alignItems="center" className={classes.root}>
      <Grid item>
        <Text className={classes.text}> Cluster nodes</Text>
        <SearchBar
          className={classes.search}
          onSearchChange={handleLeftSearchChange}
          searchTerm={searchLeft}
        />
        {customList(left, 'left')}
      </Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          {/* <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleAllRight}
            disabled={left.length === 0}
            aria-label="move all right"
          >
            ≫
          </Button> */}
          <Button
            size="small"
            className={classes.button}
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            size="small"
            className={classes.button}
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
          {/* <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleAllLeft}
            disabled={right.length === 0}
            aria-label="move all left"
          >
            ≪
          </Button> */}
        </Grid>
      </Grid>
      <Grid item className={classes.list}>
        <Text className={classes.text}> Selected nodes</Text>
        <SearchBar
          className={classes.search}
          onSearchChange={handleRightSearchChange}
          searchTerm={searchRight}
        />
        {customList(right, 'right')}
      </Grid>
    </Grid>
  )
}

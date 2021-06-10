import React from 'react'
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
}))

function not(a, b) {
  return a.filter((valueA) => {
    if (b.length > 0) {
      return b.filter((valueB) => {
        return valueB.name
          ? valueB.name.indexOf(valueA.name) === -1
          : valueB.indexOf(valueA.name) === -1
      })
    }
  })
}

function intersection(a, b) {
  return a.filter((valueA) => {
    if (b.length > 0) {
      return b.filter((valueB) => {
        return valueB.name ? valueB.name.indexOf(valueA) !== -1 : valueB.indexOf(valueA) !== -1
      })
    }
  })
}

export default function TransferList({ clusterNodes }) {
  console.log('clusterNodes', clusterNodes)
  const classes = useStyles()
  const [checked, setChecked] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [left, setLeft] = React.useState(clusterNodes)
  const [right, setRight] = React.useState([])

  const leftChecked = intersection(checked, left)
  const rightChecked = intersection(checked, right)
  console.log(leftChecked, rightChecked)
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
    setLeft(not(left, leftChecked))
    setChecked(not(checked, leftChecked))
  }

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked))
    setRight(not(right, rightChecked))
    setChecked(not(checked, rightChecked))
  }

  const customList = (items) => (
    <Paper className={classes.paper}>
      <List dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${value.name ? value.name : value}-label`

          return (
            <ListItem
              className={classes.listItem}
              key={value.name ? value.name : value}
              role="listitem"
              button
              onClick={handleToggle(value.name ? value.name : value)}
            >
              <ListItemIcon>
                <Checkbox
                  color={'primary'}
                  checked={checked.indexOf(value.name ? value.name : value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${value.name ? value.name : value}`} />
            </ListItem>
          )
        })}
        <ListItem />
      </List>
    </Paper>
  )

  const handleSearchChange = (searchTerm) => setSearchTerm(searchTerm)

  return (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Grid item>
        <SearchBar
          className={classes.search}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        />
        {customList(left)}
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
      <Grid item>
        <SearchBar
          className={classes.search}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        />
        {customList(right)}
      </Grid>
    </Grid>
  )
}

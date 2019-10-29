import React from 'react'
import { FormControl, MenuItem, Select, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  root: {
    maxWidth: 50,
    margin: theme.spacing(1),
  },
  select: {
    width: 44,
    '& .MuiSelect-selectMenu': {
      paddingRight: theme.spacing(1),
    },
  },
})

const PerPageControl = ({ classes, value, onChangeRowsPerPage, rowsPerPageOptions }) => {
  const [open, setOpen] = React.useState(false)
  const options = rowsPerPageOptions.map(x => ({ label: x, value: x }))
  return (
    <FormControl className={classes.root}>
      <Tooltip title={'Rows per page'} open={open}>
        <Select
          className={classes.select}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={() => setOpen(false)}
          value={value}
          options={options}
          onChange={onChangeRowsPerPage}
          disableUnderline
        >
          {rowsPerPageOptions.map(pp => <MenuItem value={pp} key={pp}>{pp}</MenuItem>)}
        </Select>
      </Tooltip>
    </FormControl>
  )
}

export default withStyles(styles)(PerPageControl)
